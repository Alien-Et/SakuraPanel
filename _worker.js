import { 路由处理 } from './src/路由处理.js';

// ====================== 入口文件 ======================
export default {
  async fetch(请求, env) {
    return 路由处理(请求, env);
  }
};
