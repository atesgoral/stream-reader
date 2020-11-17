const ProducerConsumer = require('../producer-consumer');
// const StreamReader = require('..');

function nextTick() {
  return new Promise(process.nextTick);
}

function tap(promise) {
  promise
    .then((result) => {
      promise.isResolved = true;
      return result;
    })
    .catch((error) => {
      promise.isRejected = true;
      throw error;
    });

  return promise;
}

describe('ProducerConsumer', () => {
  let producerConsumer = null;

  beforeEach(() => {
    producerConsumer = new ProducerConsumer();
  });

  test('#produce returns a pending promise', async () => {
    const produce = tap(producerConsumer.produce({}));

    await nextTick();

    expect(produce.isResolved).toBeFalsy();
    expect(produce.isRejected).toBeFalsy();
  });

  test('#produce returns two pending promises when called twice', async () => {
    const produce1 = tap(producerConsumer.produce({}));
    const produce2 = tap(producerConsumer.produce({}));

    await nextTick();

    expect(produce1.isResolved).toBeFalsy();
    expect(produce1.isRejected).toBeFalsy();
    expect(produce2.isResolved).toBeFalsy();
    expect(produce2.isRejected).toBeFalsy();
  });

  test('#consume returns a pending promise', async () => {
    const consume = tap(producerConsumer.consume(2));

    await nextTick();

    expect(consume.isResolved).toBeFalsy();
    expect(consume.isRejected).toBeFalsy();
  });

  test('#consume returns two pending promises when called twice', async () => {
    const consume1 = tap(producerConsumer.consume(2));
    const consume2 = tap(producerConsumer.consume(2));

    await nextTick();

    expect(consume1.isResolved).toBeFalsy();
    expect(consume1.isRejected).toBeFalsy();
    expect(consume2.isResolved).toBeFalsy();
    expect(consume2.isRejected).toBeFalsy();
  });

  describe('when exact units is consumed as produced', () => {
    test('#consume returns a promise resolved with a chunk', async () => {
      producerConsumer.produce({
        buffer: [ 1, 2 ],
        consume(units) {
          return this.buffer;
        },
        isDepleted() {
          return true;
        }
      });

      const chunk = await producerConsumer.consume(2);

      expect(chunk).toEqual([ 1, 2 ]); // or buffer?
    });
  });
});

/*
describe('StreamReader', () => {
  let streamReader = null;

  beforeEach(() => {
    streamReader = new StreamReader();
  });

  test('#read blocks when there is no data', async () => {
    expect.assertions(2);

    const read = tap(streamReader.read(1));

    await nextTick();

    expect(read.isResolved).toBeFalsy();
    expect(read.isRejected).toBeFalsy();
  });

  test('#read resolves when there is enough data written before call', async () => {
    expect.assertions(1);

    streamReader._write(Buffer.from('abc'));

    return expect(streamReader.read(3)).resolves.toEqual(Buffer.from('abc'));
  });

  test('#read resolves when there is enough data written after call', async () => {
    expect.assertions(1);

    const ret = expect(streamReader.read(3)).resolves.toEqual(Buffer.from('abc'));

    streamReader._write(Buffer.from('abc'));

    return ret;
  });

  test('#read blocks when there is not enough data written before call', async () => {
    expect.assertions(2);

    streamReader._write(Buffer.from('abc'));

    const read = tap(streamReader.read(5));

    await nextTick();

    expect(read.isResolved).toBeFalsy();
    expect(read.isRejected).toBeFalsy();
  });

  test('#read blocks when there is not enough data written after call', async () => {
    expect.assertions(2);

    const read = tap(streamReader.read(5));

    streamReader._write(Buffer.from('abc'));

    await nextTick();

    expect(read.isResolved).toBeFalsy();
    expect(read.isRejected).toBeFalsy();
  });

  test('#read eventually resolves when there is enough data written after call', async () => {
    console.log('--- TEST START ---');

    expect.assertions(3);

    console.log('WRITE 3');
    streamReader._write(Buffer.from('abc'));

    console.log('READ 5');
    const read = tap(streamReader.read(5));

    await nextTick();

    expect(read.isResolved).toBeFalsy();
    expect(read.isRejected).toBeFalsy();

    console.log('WRITE 2');
    streamReader._write(Buffer.from('de'));

    console.log('WRITE 2 DONE');

    return expect(read).resolves.toEqual(Buffer.from('abcde'));
  });
});
*/
