/**
 * Created by pheyvaer on 05.05.17.
 */

function InvalidIteratorError(message, iterator) {
  this.name = 'InvalidIteratorError';
  this.message = message || '';
  this.iterator = iterator;
  this.stack = (new Error()).stack;
}

InvalidIteratorError.prototype = Object.create(Error.prototype);
InvalidIteratorError.prototype.constructor = InvalidIteratorError;

module.exports = InvalidIteratorError;