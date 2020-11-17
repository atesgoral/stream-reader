<<<<<<< HEAD
/** Meant as documentation of the chunk archetype, but can also be used as a base class */
class Chunk {
  /**
   * Consumes units out of available produced chunks and returns a collated chunk
   * @param {*} units Abstract units to consume from available chunks
   * @param {Object} context An optional scratch area to use to collate data from multiple chunks
   */
  consume(units, context) {

  }

  /**
   * @returns {Boolean} Whether the chunk is completely depleted
   */
  get isDepleted() {

  }
}

class ProducerConsumer { // -> +Broker
  constructor() {
    this.pendingProducers = []; // -> productions / produceQueue
    this.pendingConsumers = []; // -> consumptions / consumeQueue
  }

  _consumePending() { // -> broker
    if (!this.pendingConsumers || !this.pendingProducers) {
      return;
    }

    this.pendingConsumers = this.pendingConsumers.filter((consumer) => {
      try {
        const context = {};
        const chunk = this.pendingProducers.some((producer) => producer.chunk.consume(consumer.units, context));

        if (chunk) {
          this.pendingProducers = this.pendingProducers.filter((producer) => !producer.chunk.isDepleted);
          consumer.resolve(chunk);
          return false;
        } else {
          return true;
        }
      } catch (err) {
        consumer.reject(err);
      }
    });
  }

  consume(units) {
    return new Promise((resolve, reject) => {
      this.pendingConsumers.push({
        units,
        reject,
        resolve
      });

      this._consumePending();
    });
  }

  /**
   * The producer calls this to present a chunk to be consumed
   * @param {Chunk} chunk A chunk object to hold some data. See the Chunk class documentation.
   * @returns {Promise} Resolved when the entire chunk is consumed.
   */
  produce(chunk) {
    return new Promise((resolve, reject) => {
      this.pendingProducers.push({
        chunk,
        resolve,
        reject
      });

      if (this.pendingConsumer) {
        this._consumePending();
      }
=======
class ProducerConsumer {
  constructor() {
    this.buffer = [];
    this.producerQueue = [];
    this.producerQueueResolver = null;
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

    let chunk = this.buffer
      ? Buffer.concat([ this.buffer, newChunk ])
      : newChunk;
    let chunkStart = 0;

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
>>>>>>> 5e094d0... Stashing changes
    });
  }

  // @todo to signal no need to deplete latest chunk
  // pass thru?
<<<<<<< HEAD
  // end() {

  // }
}

module.exports = ProducerConsumer;
=======
  end() {

  }

}
>>>>>>> 5e094d0... Stashing changes
