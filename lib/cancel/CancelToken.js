'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  // 经典实现之一，如何在外部控制promise的执行
  // 这里实现了promise.resolve的缓存，存在resolvePromise上，什么时候resolvePromise执行，然后then上定义的函数才会执行
  // 实现了在外部手动控制promise的继续
  // 举个例子
  // let resolveHandle;
  // new Promise((resolve)=>{
  //   resolveHandle=resolve;
  // }).then((val)=>{
  //   console.log('resolve',val);
  // });
  // 在这串代码中，什么时候resolveHanlder执行是，后续的then中定义的函数才会跟着执行
  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    // 这是用到了Cancel函数
    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    // 什么时候cancel执行，token.promise上定义的一个异步任务才会执行
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;
