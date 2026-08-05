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
  <title>💔 KV未绑定</title>
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

// ====================== 服务器错误界面 - 模板 ======================
export function 生成错误页面(错误信息) {
  const msg = (错误信息 || '').toLowerCase();
  const 是KV错误 = msg.includes('kv') || msg.includes('429') || msg.includes('quota') || msg.includes('exceeded') || msg.includes('rate limit');
  // 转义 HTML 特殊字符，防止错误信息中的 <>&" 破坏页面结构
  const 转义信息 = (错误信息 || '未知错误').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const 标题 = 是KV错误 ? 'KV配额已用完' : '服务器开小差了';
  const 说明 = 是KV错误
    ? 'Cloudflare KV 存储的每日免费配额已经用完啦~<br>请等待 <span class="highlight">每天 UTC 0点</span> 自动重置，<br>或前往 Cloudflare 控制台查看配额使用情况。'
    : '服务器处理请求时遇到了一些问题~<br>请稍后 <span class="highlight">刷新重试</span>，如果问题持续存在，请检查配置。';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${标题}</title>
  <style>${样式}</style>
  <style>
    .retry-btn {
      display: inline-block;
      margin-top: 15px;
      padding: 10px 30px;
      background: linear-gradient(135deg, #ff69b4, #ff85a2);
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 1.05em;
      cursor: pointer;
      font-family: inherit;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
    }
    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 105, 180, 0.4);
    }
    .error-detail {
      margin-top: 15px;
      font-size: 0.8em;
      color: #aaa;
      word-break: break-all;
      opacity: 0.7;
    }
    @media (prefers-color-scheme: dark) {
      .error-detail { color: #666; }
    }
  </style>
</head>
<body>
  <img id="backgroundImage" class="background-media">
  ${花瓣容器HTML}
  <div class="content">
    <h1>${标题}</h1>
    <p>${说明}</p>
    <button class="retry-btn" onclick="location.reload()">🔄 刷新重试</button>
    <div class="error-detail">${转义信息}</div>
    <div class="powered-by">由 <a href="https://github.com/Alien-Et/SakuraPanel" target="_blank" rel="noopener noreferrer">SakuraPanel</a> 项目驱动</div>
  </div>
  <script>${生成脚本({ 默认白天背景图, 默认暗黑背景图 })}</script>
</body>
</html>
  `;
}
