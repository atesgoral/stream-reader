const StreamReader = require('..');

function nextTick() {
  return new Promise(process.nextTick);
}

function monitor(promise) {
  const result = {};

  promise
    .then(() => result.isResolved = true)
    .catch(() => result.isRejected = true);

  return result;
}

describe('StreamReader', () => {
  let streamReader = null;

  beforeEach(() => {
    streamReader = new StreamReader();
  });

  test('#read blocks when there is no data', async () => {
    expect.assertions(2);

    const read = monitor(streamReader.read(1)); // @todo inline

    await nextTick();

    expect(read.isResolved).toBeFalsy();
    expect(read.isRejected).toBeFalsy();
  });

  test('#read resolves when there enough data written before', async () => {
    expect.assertions(1);

    streamReader._write(Buffer.from('abc'));

    return expect(streamReader.read(3)).resolves.toEqual(Buffer.from('abc'));
  });

  test('#read resolves when there is enough data written after', async () => {
    expect.assertions(1);

    const ret = expect(streamReader.read(3)).resolves.toEqual(Buffer.from('abc'));

    streamReader._write(Buffer.from('abc'));

    return ret;
  });
});
