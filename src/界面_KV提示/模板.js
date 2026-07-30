import { 默认白天背景图, 默认暗黑背景图 } from '../常量.js';
import { 样式 } from './样式.js';
import { 生成脚本 } from './脚本.js';
import { 容器HTML as 花瓣容器HTML } from '../界面_主题/花瓣效果.js';

// ====================== KV未绑定提示界面 - 模板 ======================
export function 生成KV未绑定提示页面() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${样式}</style>
</head>
<body>
  <img id="backgroundImage" class="background-media">
  ${花瓣容器HTML}
  <div class="content">
    <h1>💔 哎呀，KV没绑定哦</h1>
    <p>喂！大臭宝，你的 <span class="highlight">Cloudflare KV 存储空间</span> 还没绑定呢~<br>快去 <span class="highlight">Cloudflare Workers</span> 设置里绑一个 KV 命名空间（变量名：<span class="highlight">KV数据库</span>），然后重新部署一下吧！</p>
    <div class="instruction">绑定好后 <span class="highlight">刷新界面</span> 就可以进入注册啦~</div>
    <div class="powered-by">由 <a href="https://github.com/Alien-Et/SakuraPanel" target="_blank" rel="noopener noreferrer">SakuraPanel</a> 项目驱动</div>
  </div>
  <script>${生成脚本({ 默认白天背景图, 默认暗黑背景图 })}</script>
</body>
</html>
  `;
}
