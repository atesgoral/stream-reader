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
    });
  }

  // @todo to signal no need to deplete latest chunk
  // pass thru?
  // end() {

  // }
}

module.exports = ProducerConsumer;
