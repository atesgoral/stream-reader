const Writable = require('stream').Writable;

class StreamReader extends Writable {
  constructor(options) {
    super(options);
    this.buffer = null;
    this.readQueue = [];
    this.readQueueResolver = null;
  }

  queueRead(count, resolve) {
    console.log('queueRead', count);

    this.readQueue.push({ count, resolve });

    if (this.readQueueResolver) {
      console.log('resolving read queue');
      this.readQueueResolver();
      this.readQueueResolver = null;
    }
  }

  readQueued() {
    console.log('readQueued');

    return new Promise((resolve, reject) => {
      // if (this.readQueue.length) {
      //   console.log('resolving');
      //   resolve();
      // } else {
        console.log('setting resolver');
        this.readQueueResolver = resolve;
      // }
    });
  }

  async depleteChunk(newChunk) {
    console.log('depleteChunk');

    console.log('have buffer', !!this.buffer);

    let chunk = this.buffer
      ? Buffer.concat([ this.buffer, newChunk ])
      : newChunk;
    let chunkStart = 0;

    console.log('chunk len', chunk.length);

    this.buffer = null;

    while (chunkStart < chunk.length) {
      if (!this.readQueue.length) {
        console.log('awaiting queue');
        await this.readQueued();
      }

      console.log('got queued reads', this.readQueue.length);

      const read = this.readQueue.shift();

      const haveEnoughBytesInChunk = read.count <= chunk.length;

      if (haveEnoughBytesInChunk) {
        console.log('have enough bytes');
        read.resolve(chunk.slice(chunkStart, chunkStart += read.count));
      } else {
        console.log('not enough bytes');
        this.buffer = chunk;
        break;
      }
    }

    return Promise.resolve();
  }

  _write(chunk, encoding, callback) {
    console.log('_write', chunk.length);

    this.depleteChunk(chunk)
      .then(callback)
      .catch(callback);
  }

  // @todo implement _writev?

  // @todo implement _destroy

  read(count) {
    return new Promise((resolve, reject) => {
      this.queueRead(count, resolve); // @todo return Promise from queueRead instead?
    });
  }

  write(chunk, enmcoding) {
    return new Promise((resolve, reject) => {
      this._write(chunk, encoding, resolve);
    });
  }

  // @todo to signal no need to deplete latest chunk
  // pass thru?
  end() {

  }
}

module.exports = StreamReader;
