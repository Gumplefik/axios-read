'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios'); // 构造函数
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
// 创建默认的实例
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  // context.request的绑定
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  // 继承原型上的方法
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
// 创建实例
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
// 暴露构造函数
axios.Axios = Axios;

// Factory for creating new instances
// 暴露工厂函数，相对上面的多了些配置
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
// 挂载cancel函数，这个函数是调用token.cancel的时候才会执行，然后也是用来表示这个请求是不是已经取消了的
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
// spread用于借调函数，apply的包装
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
// 出口
module.exports.default = axios;
