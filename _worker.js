import { connect } from 'cloudflare:sockets';

// 基础配置
let 配置路径 = "config";
let 优选节点 = [];
let 反代地址 = 'ts.hpc.tw';
let SOCKS5账号 = '';
let 节点名称 = '🌸樱花';
let 伪装域名 = 'lkssite.vip';
let 最大失败次数 = 5;
let 锁定时间 = 5 * 60 * 1000;
let 白天背景图 = 'https://i.meee.com.tw/el91luR.png';
let 暗黑背景图 = 'https://i.meee.com.tw/QPWx8nX.png';

// ====================== 辅助函数 ======================
function 创建HTML响应(内容, 状态码 = 200) {
  return new Response(内容, {
    status: 状态码,
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
    }
  });
}

function 创建重定向响应(路径, 额外头 = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": 路径,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...额外头
    }
  });
}

function 创建JSON响应(数据, 状态码 = 200, 额外头 = {}) {
  return new Response(JSON.stringify(数据), {
    status: 状态码,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...额外头
    }
  });
}

function 生成UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function 加密密码(密码) {
  const encoder = new TextEncoder();
  const data = encoder.encode(密码);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function 检查锁定(env, 设备标识) {
  const 锁定时间戳 = await env.KV数据库.get(`lock_${设备标识}`);
  const 当前时间 = Date.now();
  const 被锁定 = 锁定时间戳 && 当前时间 < Number(锁定时间戳);
  return {
    被锁定,
    剩余时间: 被锁定 ? Math.ceil((Number(锁定时间戳) - 当前时间) / 1000) : 0
  };
}

function 生成登录注册界面(类型, 额外参数 = {}) {
  const 界面数据 = {
    注册: {
      title: '🌸首次使用注册🌸',
      表单: `
        <form class="auth-form" action="/register/submit" method="POST" enctype="application/x-www-form-urlencoded">
          <input type="text" name="username" placeholder="设置账号" required pattern="^[a-zA-Z0-9]{4,20}$" title="4-20位字母数字">
          <input type="password" name="password" placeholder="设置密码" required minlength="6">
          <input type="password" name="confirm" placeholder="确认密码" required>
          <button type="submit">立即注册</button>
        </form>
        ${额外参数.错误信息 ? `<div class="error-message">${额外参数.错误信息}</div>` : ''}
      `
    },
    登录: {
      title: '🌸欢迎回来🌸',
      表单: `
        <form class="auth-form" action="/login/submit" method="POST" enctype="application/x-www-form-urlencoded">
          <input type="text" name="username" placeholder="登录账号" required>
          <input type="password" name="password" placeholder="登录密码" required>
          <button type="submit" id="loginButton" ${额外参数.锁定状态 ? 'disabled' : ''}>立即登录</button>
        </form>
        ${额外参数.输错密码 ? `<div class="error-message">密码错误，剩余尝试次数：${额外参数.剩余次数}</div>` : ''}
        ${额外参数.锁定状态 ? `
          <div class="lock-message">
            账户锁定，请<span id="countdown">${额外参数.剩余时间}</span>秒后重试
          </div>` : ''}
        ${额外参数.错误信息 ? `<div class="error-message">${额外参数.错误信息}</div>` : ''}
      `
    }
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Quicksand', 'Comic Sans MS', 'Arial', sans-serif;
      color: #ff6f91;
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
      transition: background 0.5s ease;
    }
    
    @media (prefers-color-scheme: light) {
      body { background: linear-gradient(135deg, #ffe6f0, #fff0f5); }
      .auth-container { background: rgba(255, 245, 247, 0.9); box-shadow: 0 8px 20px rgba(255, 182, 193, 0.3); }
      .floating-petals { background: rgba(255, 255, 255, 0.7); }
    }
    
    @media (prefers-color-scheme: dark) {
      body { background: linear-gradient(135deg, #1e1e2f, #2a2a3b); }
      .auth-container { background: rgba(30, 30, 30, 0.9); color: #ffd1dc; box-shadow: 0 8px 20px rgba(255, 133, 162, 0.2); }
      .floating-petals { background: rgba(255, 255, 255, 0.1); }
    }
    
    .background-media {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -1;
      transition: opacity 0.5s ease;
    }
    
    /* 漂浮花瓣效果 */
    .floating-petals {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    
    .petal {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50% 0;
      opacity: 0.7;
      animation: float linear infinite;
    }
    
    @keyframes float {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0.7;
      }
      100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
    
    /* 可爱装饰元素 */
    .cute-decoration {
      position: absolute;
      width: 60px;
      height: 60px;
      opacity: 0.8;
      z-index: 0;
      animation: bounce 3s infinite alternate ease-in-out;
    }
    
    .cute-decoration:nth-child(odd) {
      animation-delay: 0.5s;
    }
    
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-20px);
      }
    }
    
    .auth-container {
      padding: 40px;
      border-radius: 30px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      position: relative;
      z-index: 1;
      backdrop-filter: blur(10px);
      animation: fadeIn 0.8s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    h1 {
      font-size: 2em;
      color: #ff69b4;
      margin-bottom: 30px;
      text-shadow: 2px 2px 4px rgba(255, 105, 180, 0.3);
      animation: pulse 2s infinite alternate;
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      100% {
        transform: scale(1.05);
      }
    }
    
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
    }
    
    .auth-form input {
      padding: 15px;
      border-radius: 25px;
      border: 2px solid #ffb6c1;
      font-size: 1em;
      width: 100%;
      box-sizing: border-box;
      transition: all 0.3s ease;
      background-color: rgba(255, 255, 255, 0.7);
    }
    
    .auth-form input:focus {
      border-color: #ff69b4;
      box-shadow: 0 0 10px rgba(255, 105, 180, 0.3);
      transform: scale(1.02);
      outline: none;
    }
    
    .auth-form button {
      padding: 15px;
      background: linear-gradient(to right, #ffb6c1, #ff69b4);
      color: white;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      font-size: 1.1em;
      font-weight: bold;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .auth-form button:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s;
    }
    
    .auth-form button:hover:before {
      left: 100%;
    }
    
    .auth-form button:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 20px rgba(255, 105, 180, 0.4);
    }
    
    .auth-form button:active {
      transform: scale(0.98);
    }
    
    .auth-form button:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }
    
    .error-message {
      color: #ff6666;
      margin-top: 20px;
      font-size: 0.9em;
      animation: shake 0.5s;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .lock-message {
      color: #ff6666;
      margin-top: 20px;
      font-size: 1.1em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    
    #countdown {
      color: #ff1493;
      font-weight: bold;
      min-width: 50px;
      text-align: center;
      animation: pulse 1s infinite alternate;
    }
    
    /* 可爱图标 */
    .cute-icon {
      position: absolute;
      font-size: 1.5em;
      animation: float-icon 3s infinite ease-in-out;
    }
    
    .cute-icon:nth-child(1) {
      top: -20px;
      left: 20px;
      animation-delay: 0.2s;
    }
    
    .cute-icon:nth-child(2) {
      top: -20px;
      right: 20px;
      animation-delay: 0.7s;
    }
    
    @keyframes float-icon {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-10px) rotate(10deg);
      }
    }
    
    @media (max-width: 600px) {
      .auth-container { padding: 25px; }
      h1 { font-size: 1.7em; }
      .auth-form input, .auth-form button { padding: 12px; font-size: 1em; }
    }
  </style>
</head>
<body>
  <img id="backgroundImage" class="background-media">
  <div class="floating-petals" id="petalsContainer"></div>
  
  <div class="auth-container">
    <div class="cute-icon">🌸</div>
    <div class="cute-icon">🌺</div>
    <h1>${界面数据[类型].title}</h1>
    ${界面数据[类型].表单}
  </div>
  
  <script>
    // 背景图片切换
    const lightBg = '${白天背景图}';
    const darkBg = '${暗黑背景图}';
    const bgImage = document.getElementById('backgroundImage');

    function updateBackground() {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      bgImage.src = isDarkMode ? darkBg : lightBg;
      bgImage.onerror = () => { bgImage.style.display = 'none'; };
    }
    updateBackground();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateBackground);

    // 创建漂浮花瓣效果
    function createPetal() {
      const petalsContainer = document.getElementById('petalsContainer');
      const petal = document.createElement('div');
      petal.className = 'petal';
      
      // 随机花瓣颜色
      const colors = ['#ffb6c1', '#ff69b4', '#ffc0cb', '#ff1493', '#ffd1dc'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // 随机大小
      const size = Math.random() * 15 + 5;
      
      // 随机位置
      const left = Math.random() * 100;
      
      // 随机动画时长
      const duration = Math.random() * 10 + 10;
      
      petal.style.backgroundColor = color;
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';
      petal.style.left = left + '%';
      petal.style.animationDuration = duration + 's';
      
      petalsContainer.appendChild(petal);
      
      // 动画结束后移除花瓣
      setTimeout(() => {
        petal.remove();
      }, duration * 1000);
    }
    
    // 定期创建花瓣
    setInterval(createPetal, 500);
    
    // 初始创建一些花瓣
    for (let i = 0; i < 20; i++) {
      setTimeout(createPetal, i * 200);
    }

    // 倒计时逻辑
    let remainingTime = ${(额外参数.锁定状态 ? 额外参数.剩余时间 : 0)};
    const countdownElement = document.getElementById('countdown');
    const loginButton = document.getElementById('loginButton');

    function startCountdown() {
      if (!countdownElement) return;

      const interval = setInterval(() => {
        if (remainingTime <= 0) {
          clearInterval(interval);
          countdownElement.textContent = '0';
          loginButton.disabled = false;
          document.querySelector('.lock-message').textContent = '锁定已解除，请重新尝试登录';
          fetch('/reset-login-failures', { method: 'POST' });
          return;
        }
        countdownElement.textContent = remainingTime;
        remainingTime--;
      }, 1000);
    }

    function syncWithServer() {
      fetch('/check-lock')
        .then(response => response.json())
        .then(data => {
          if (data.locked) {
            remainingTime = data.remainingTime;
            countdownElement.textContent = remainingTime;
            loginButton.disabled = true;
          } else {
            remainingTime = 0;
            countdownElement.textContent = '0';
            loginButton.disabled = false;
            document.querySelector('.lock-message').textContent = '锁定已解除，请重新尝试登录';
          }
        })
        .catch(error => {
          console.error('同步锁定状态失败:', error);
        });
    }

    if (${额外参数.锁定状态 ? 'true' : 'false'}) {
      startCountdown();
      setInterval(syncWithServer, 10000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          syncWithServer();
        }
      });
    }

    // 防止 UA 切换触发表单提交
    document.querySelector('.auth-form')?.addEventListener('submit', function(event) {
      if (!event.isTrusted) {
        event.preventDefault();
        console.log('阻止非用户触发的表单提交');
      }
    });

    // 监听 UA 变化并平滑处理
    let lastUA = navigator.userAgent;
    function checkUAChange() {
      const currentUA = navigator.userAgent;
      if (currentUA !== lastUA) {
        console.log('UA 已切换，从', lastUA, '到', currentUA);
        lastUA = currentUA;
      }
    }
    setInterval(checkUAChange, 500);
    
    // 添加输入框聚焦效果
    const inputs = document.querySelectorAll('.auth-form input');
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
      });
      
      input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
      });
    });
  </script>
</body>
</html>
  `;
}

// ====================== 节点配置相关 ======================
async function 获取或初始化UUID(env) {
  let uuid = await env.KV数据库.get('current_uuid');
  if (!uuid) {
    uuid = 生成UUID();
    await env.KV数据库.put('current_uuid', uuid);
  }
  return uuid;
}

async function 加载节点和配置(env, hostName) {
  try {
    const 节点路径缓存 = await env.KV数据库.get('node_file_paths');
    let 节点文件路径 = 节点路径缓存 
      ? JSON.parse(节点路径缓存) 
      : ['https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt', 'https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt'];

    const 手动节点缓存 = await env.KV数据库.get('manual_preferred_ips');
    let 手动节点列表 = [];
    if (手动节点缓存) {
      手动节点列表 = JSON.parse(手动节点缓存).map(line => line.trim()).filter(Boolean);
    }

    const 响应列表 = await Promise.all(
      节点文件路径.map(async (路径) => {
        try {
          const 响应 = await fetch(路径);
          if (!响应.ok) throw new Error(`请求 ${路径} 失败，状态码: ${响应.status}`);
          const 文本 = await 响应.text();
          return 文本.split('\n').map(line => line.trim()).filter(Boolean);
        } catch (错误) {
          console.error(`拉取 ${路径} 失败: ${错误.message}`);
          return [];
        }
      })
    );

    const 域名节点列表 = [...new Set(响应列表.flat())];
    const 合并节点列表 = [...new Set([...手动节点列表, ...域名节点列表])];
    const 缓存节点 = await env.KV数据库.get('ip_preferred_ips');
    const 当前节点列表 = 缓存节点 ? JSON.parse(缓存节点) : [];
    const 列表相同 = JSON.stringify(合并节点列表) === JSON.stringify(当前节点列表);

    if (合并节点列表.length > 0) {
      优选节点 = 合并节点列表;
      if (!列表相同) {
        const 新版本 = String(Date.now());
        await env.KV数据库.put('ip_preferred_ips', JSON.stringify(合并节点列表));
        await env.KV数据库.put('ip_preferred_ips_version', 新版本);
        await env.KV数据库.put('config_' + atob('Y2xhc2g='), await 生成猫咪(env, hostName));
        await env.KV数据库.put('config_' + atob('Y2xhc2g=') + '_version', 新版本);
        await env.KV数据库.put('config_' + atob('djJyYXk='), await 生成通用(env, hostName));
        await env.KV数据库.put('config_' + atob('djJyYXk=') + '_version', 新版本);
      }
    } else {
      优选节点 = 当前节点列表.length > 0 ? 当前节点列表 : [`${hostName}:443`];
    }

    await env.KV数据库.put('node_file_paths', JSON.stringify(节点文件路径));
  } catch (错误) {
    const 缓存节点 = await env.KV数据库.get('ip_preferred_ips');
    优选节点 = 缓存节点 ? JSON.parse(缓存节点) : [`${hostName}:443`];
    await env.KV数据库.put('ip_error_log', JSON.stringify({ time: Date.now(), error: '所有路径拉取失败或手动上传为空' }), { expirationTtl: 86400 });
  }
}

async function 获取配置(env, 类型, hostName) {
  const 缓存键 = 类型 === atob('Y2xhc2g=') ? 'config_' + atob('Y2xhc2g=') : 'config_' + atob('djJyYXk=');
  const 版本键 = `${缓存键}_version`;
  const 缓存配置 = await env.KV数据库.get(缓存键);
  const 配置版本 = await env.KV数据库.get(版本键) || '0';
  const 节点版本 = await env.KV数据库.get('ip_preferred_ips_version') || '0';

  if (缓存配置 && 配置版本 === 节点版本) {
    return 缓存配置;
  }

  const 新配置 = 类型 === atob('Y2xhc2g=') ? await 生成猫咪(env, hostName) : await 生成通用(env, hostName);
  await env.KV数据库.put(缓存键, 新配置);
  await env.KV数据库.put(版本键, 节点版本);
  return 新配置;
}

// ====================== 主逻辑 ======================
export default {
  async fetch(请求, env) {
    try {
      if (!env.KV数据库) {
        return 创建HTML响应(生成KV未绑定提示页面());
      }

      const 请求头 = 请求.headers.get('Upgrade');
      const url = new URL(请求.url);
      const hostName = 请求.headers.get('Host');
      const UA = 请求.headers.get('User-Agent') || 'unknown';
      const IP = 请求.headers.get('CF-Connecting-IP') || 'unknown';
      const 设备标识 = `${UA}_${IP}`;
      let formData;

      if (请求头 && 请求头 === 'websocket') {
        反代地址 = env.PROXYIP || 反代地址;
        SOCKS5账号 = env.SOCKS5 || SOCKS5账号;
        return await 升级请求(请求, env);
      }

      if (url.pathname === '/login/submit' || url.pathname === '/register/submit') {
        const contentType = 请求.headers.get('Content-Type') || '';
        if (!contentType.includes('application/x-www-form-urlencoded') && !contentType.includes('multipart/form-data')) {
          console.log(`无效请求: UA=${UA}, IP=${IP}, Path=${url.pathname}, Headers=${JSON.stringify([...请求.headers])}`);
          return 创建HTML响应(生成登录注册界面(url.pathname === '/login/submit' ? '登录' : '注册', {
            错误信息: '请通过正常表单提交'
          }), 400);
        }

        try {
          formData = await 请求.formData();
        } catch (错误) {
          return 创建HTML响应(生成登录注册界面(url.pathname === '/login/submit' ? '登录' : '注册', {
            错误信息: '提交数据格式错误，请重试'
          }), 400);
        }
      }

      if (url.pathname === '/register/submit') {
        const 用户名 = formData.get('username');
        const 密码 = formData.get('password');
        const 确认密码 = formData.get('confirm');

        if (!用户名 || !密码 || 密码 !== 确认密码) {
          return 创建HTML响应(生成登录注册界面('注册', { 
            错误信息: 密码 !== 确认密码 ? '两次密码不一致' : '请填写完整信息'
          }), 400);
        }

        const 已有用户 = await env.KV数据库.get('stored_credentials');
        if (已有用户) {
          return 创建重定向响应('/login');
        }

        const 加密密码值 = await 加密密码(密码);
        await env.KV数据库.put('stored_credentials', JSON.stringify({
          用户名, 密码: 加密密码值
        }));

        const 新Token = Math.random().toString(36).substring(2);
        await env.KV数据库.put('current_token', 新Token, { expirationTtl: 300 });
        return 创建重定向响应(`/${配置路径}`, { 
          'Set-Cookie': `token=${新Token}; Path=/; HttpOnly; SameSite=Strict` 
        });
      }

      if (url.pathname === '/login/submit') {
        const 锁定状态 = await 检查锁定(env, 设备标识);
        if (锁定状态.被锁定) {
          return 创建HTML响应(生成登录注册界面('登录', {
            锁定状态: true,
            剩余时间: 锁定状态.剩余时间
          }), 403);
        }

        const 存储凭据 = await env.KV数据库.get('stored_credentials');
        if (!存储凭据) {
          return 创建重定向响应('/register');
        }

        const 输入用户名 = formData.get('username');
        const 输入密码 = formData.get('password');

        const 凭据对象 = JSON.parse(存储凭据 || '{}');
        const 密码匹配 = (await 加密密码(输入密码)) === 凭据对象.密码;
        if (输入用户名 === 凭据对象.用户名 && 密码匹配) {
          const 新Token = Math.random().toString(36).substring(2);
          await env.KV数据库.put('current_token', 新Token, { expirationTtl: 300 });
          await env.KV数据库.put(`fail_${设备标识}`, '0');
          return 创建重定向响应(`/${配置路径}`, { 
            'Set-Cookie': `token=${新Token}; Path=/; HttpOnly; SameSite=Strict` 
          });
        }

        let 失败次数 = Number(await env.KV数据库.get(`fail_${设备标识}`) || 0) + 1;
        await env.KV数据库.put(`fail_${设备标识}`, String(失败次数));

        if (失败次数 >= 最大失败次数) {
          await env.KV数据库.put(`lock_${设备标识}`, String(Date.now() + 锁定时间), { expirationTtl: 300 });
          const 新锁定状态 = await 检查锁定(env, 设备标识);
          return 创建HTML响应(生成登录注册界面('登录', {
            锁定状态: true,
            剩余时间: 新锁定状态.剩余时间
          }), 403);
        }

        return 创建HTML响应(生成登录注册界面('登录', {
          输错密码: true,
          剩余次数: 最大失败次数 - 失败次数
        }), 401);
      }

      const 是否已注册 = await env.KV数据库.get('stored_credentials');
      if (!是否已注册 && url.pathname !== '/register') {
        return 创建HTML响应(生成登录注册界面('注册'));
      }

      switch (url.pathname) {
        case '/login':
          const 存储凭据 = await env.KV数据库.get('stored_credentials');
          if (!存储凭据) {
            return 创建重定向响应('/register');
          }

          const 锁定状态 = await 检查锁定(env, 设备标识);
          if (锁定状态.被锁定) {
            return 创建HTML响应(生成登录注册界面('登录', { 锁定状态: true, 剩余时间: 锁定状态.剩余时间 }));
          }
          if (请求.headers.get('Cookie')?.split('=')[1] === await env.KV数据库.get('current_token')) {
            return 创建重定向响应(`/${配置路径}`);
          }
          const 失败次数 = Number(await env.KV数据库.get(`fail_${设备标识}`) || 0);
          return 创建HTML响应(生成登录注册界面('登录', { 输错密码: 失败次数 > 0, 剩余次数: 最大失败次数 - 失败次数 }));

        case '/reset-login-failures':
          await env.KV数据库.put(`fail_${设备标识}`, '0');
          await env.KV数据库.delete(`lock_${设备标识}`);
          return new Response(null, { status: 200 });

        case '/check-lock':
          const 锁定检查 = await 检查锁定(env, 设备标识);
          return 创建JSON响应({
            locked: 锁定检查.被锁定,
            remainingTime: 锁定检查.剩余时间
          });

        case `/${配置路径}`:
          const Token = 请求.headers.get('Cookie')?.split('=')[1];
          const 有效Token = await env.KV数据库.get('current_token');
          if (!Token || Token !== 有效Token) return 创建重定向响应('/login');
          const uuid = await 获取或初始化UUID(env);
          return 创建HTML响应(生成订阅页面(配置路径, hostName, uuid));

        case `/${配置路径}/logout`:
          await env.KV数据库.delete('current_token');
          return 创建重定向响应('/login', { 'Set-Cookie': 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict' });

        case `/${配置路径}/` + atob('Y2xhc2g='):
          await 加载节点和配置(env, hostName);
          const config = await 获取配置(env, atob('Y2xhc2g='), hostName);
          const clashB64Enabled = await env.KV数据库.get('b64Enabled') === 'true';
          
          // 检查配置是否为Base64格式
          const clashIsBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(config) && config.length > 10;
          
          if (clashIsBase64 && clashB64Enabled) {
            // 如果是Base64加密的配置，设置适当的响应头
            return new Response(config, { 
              status: 200, 
              headers: { 
                "Content-Type": "text/plain;charset=utf-8",
                "Content-Disposition": "attachment; filename=\"clash-config.b64\"",
                "X-Config-Format": "base64"
              } 
            });
          } else {
            // 如果是普通配置，正常返回
            return new Response(config, { 
              status: 200, 
              headers: { 
                "Content-Type": "text/plain;charset=utf-8",
                "X-Config-Format": "yaml"
              } 
            });
          }

        case `/${配置路径}/` + atob('djJyYXluZw=='):
          await 加载节点和配置(env, hostName);
          const vConfig = await 获取配置(env, atob('djJyYXk='), hostName);
          const universalB64Enabled = await env.KV数据库.get('b64Enabled') === 'true';
          
          // 检查配置是否为Base64格式
          const universalIsBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(vConfig) && vConfig.length > 10;
          
          if (universalIsBase64 && universalB64Enabled) {
            // 如果是Base64加密的配置，设置适当的响应头
            return new Response(vConfig, { 
              status: 200, 
              headers: { 
                "Content-Type": "text/plain;charset=utf-8",
                "Content-Disposition": "attachment; filename=\"universal-config.b64\"",
                "X-Config-Format": "base64"
              } 
            });
          } else {
            // 如果是普通配置，正常返回
            return new Response(vConfig, { 
              status: 200, 
              headers: { 
                "Content-Type": "text/plain;charset=utf-8",
                "X-Config-Format": "uri"
              } 
            });
          }

        case `/${配置路径}/upload`:
          const uploadToken = 请求.headers.get('Cookie')?.split('=')[1];
          const 有效UploadToken = await env.KV数据库.get('current_token');
          if (!uploadToken || uploadToken !== 有效UploadToken) {
            return 创建JSON响应({ error: '未登录或Token无效，请重新登录' }, 401);
          }
          formData = await 请求.formData();
          const ipFiles = formData.getAll('ipFiles');
          if (!ipFiles || ipFiles.length === 0) {
            return 创建JSON响应({ error: '未选择任何文件' }, 400);
          }
          let allIpList = [];
          try {
            for (const ipFile of ipFiles) {
              if (!ipFile || !ipFile.text) throw new Error(`文件 ${ipFile.name} 无效`);
              
              // 验证文件格式
              if (!ipFile.name.toLowerCase().endsWith('.txt')) {
                throw new Error(`文件 ${ipFile.name} 不是txt格式，仅允许上传txt格式文件`);
              }
              
              // 验证文件大小（限制为1MB）
              if (ipFile.size > 1024 * 1024) {
                throw new Error(`文件 ${ipFile.name} 超过大小限制（1MB）`);
              }
              
              const ipText = await ipFile.text();
              
              // 验证文件内容格式
              const lines = ipText.split('\n').map(line => line.trim()).filter(Boolean);
              if (lines.length === 0) {
                console.warn(`文件 ${ipFile.name} 内容为空`);
                continue;
              }
              
              // 验证每行是否符合节点格式：[地址]:端口#节点名称@tls 或 [地址]:端口#节点名称@notls
              const validLines = [];
              for (const line of lines) {
                // 基本格式验证
                // 更灵活的节点格式验证，允许以下格式：
                // 1. 完整格式：[地址]:端口#节点名称@tls/notls
                // 2. 不带端口：[地址]#节点名称@tls/notls
                // 3. 不带tls/notls：[地址]:端口#节点名称
                // 4. 最简格式：[地址]#节点名称
                // 现在支持IP地址（IPv4/IPv6）和域名
                const nodePattern = /^(\[[0-9a-fA-F:]+\]|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*)(?::([0-9]{1,5}))?(?:#(.+?))?(?:@(tls|notls))?$/;
                const match = nodePattern.exec(line);
                if (!match) {
                  console.warn(`文件 ${ipFile.name} 中的行格式不正确，将被忽略: ${line}`);
                  continue;
                }
                
                const address = match[1];
                const port = match[2];
                const nodeName = match[3] || 节点名称; // 使用全局变量节点名称作为默认值
                const protocol = match[4] || 'tls'; // 默认使用tls
                
                // 如果有端口，验证端口范围
                if (port) {
                  const portNum = parseInt(port);
                  if (portNum < 1 || portNum > 65535) {
                    console.warn(`文件 ${ipFile.name} 中的端口无效，将被忽略: ${line}`);
                    continue;
                  }
                }
                
                // 验证IP地址格式（如果是IPv4）
                const ipv4Pattern = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/;
                if (ipv4Pattern.test(address)) {
                  const ipParts = address.split('.');
                  let isValidIPv4 = true;
                  for (const part of ipParts) {
                    const num = parseInt(part);
                    if (num < 0 || num > 255) {
                      isValidIPv4 = false;
                      break;
                    }
                  }
                  if (!isValidIPv4) {
                    console.warn(`文件 ${ipFile.name} 中的IPv4地址无效，将被忽略: ${line}`);
                    continue;
                  }
                }
                
                // 标准化节点格式
                const standardPort = port || '443'; // 默认端口443
                const standardizedLine = `${address}:${standardPort}#${nodeName}@${protocol}`;
                validLines.push(standardizedLine);
              }
              
              if (validLines.length === 0) {
                throw new Error(`文件 ${ipFile.name} 中没有符合格式要求的节点`);
              }
              
              console.log(`文件 ${ipFile.name} 验证通过，有效节点数: ${validLines.length}`);
              allIpList = allIpList.concat(validLines);
            }
            if (allIpList.length === 0) {
              return 创建JSON响应({ error: '所有上传文件中没有符合格式要求的节点' }, 400);
            }
            const uniqueIpList = [...new Set(allIpList)];

            const 当前手动节点 = await env.KV数据库.get('manual_preferred_ips');
            const 当前节点列表 = 当前手动节点 ? JSON.parse(当前手动节点) : [];
            const 是重复上传 = JSON.stringify(当前节点列表.sort()) === JSON.stringify(uniqueIpList.sort());
            if (是重复上传) {
              return 创建JSON响应({ message: '上传内容与现有节点相同，无需更新' }, 200);
            }

            await env.KV数据库.put('manual_preferred_ips', JSON.stringify(uniqueIpList));
            const 新版本 = String(Date.now());
            await env.KV数据库.put('ip_preferred_ips_version', 新版本);
            await env.KV数据库.put('config_' + atob('Y2xhc2g='), await 生成猫咪(env, hostName));
            await env.KV数据库.put('config_' + atob('Y2xhc2g=') + '_version', 新版本);
            await env.KV数据库.put('config_' + atob('djJyYXk='), await 生成通用(env, hostName));
            await env.KV数据库.put('config_' + atob('djJyYXk=') + '_version', 新版本);
            return 创建JSON响应({ message: '上传成功，即将跳转' }, 200, { 'Location': `/${配置路径}` });
          } catch (错误) {
            console.error(`上传处理失败: ${错误.message}`);
            return 创建JSON响应({ error: `上传处理失败: ${错误.message}` }, 500);
          }

        case `/${配置路径}/change-uuid`:
          const changeToken = 请求.headers.get('Cookie')?.split('=')[1];
          const 有效ChangeToken = await env.KV数据库.get('current_token');
          if (!changeToken || changeToken !== 有效ChangeToken) {
            return 创建JSON响应({ error: '未登录或Token无效' }, 401);
          }
          const 新UUID = 生成UUID();
          await env.KV数据库.put('current_uuid', 新UUID);
          await env.KV数据库.put('config_' + atob('Y2xhc2g='), await 生成猫咪(env, hostName));
          await env.KV数据库.put('config_' + atob('djJyYXk='), await 生成通用(env, hostName));
          const 新版本 = String(Date.now());
          await env.KV数据库.put('config_' + atob('Y2xhc2g=') + '_version', 新版本);
          await env.KV数据库.put('config_' + atob('djJyYXk=') + '_version', 新版本);
          return 创建JSON响应({ uuid: 新UUID }, 200);

        case `/${配置路径}/add-node-path`:
          const addToken = 请求.headers.get('Cookie')?.split('=')[1];
          const 有效AddToken = await env.KV数据库.get('current_token');
          if (!addToken || addToken !== 有效AddToken) {
            return 创建JSON响应({ error: '未登录或Token无效' }, 401);
          }
          const addData = await 请求.json();
          const newPath = addData.path;
          if (!newPath || !newPath.match(/^https?:\/\//)) {
            return 创建JSON响应({ error: '无效的URL格式' }, 400);
          }
          let currentPaths = await env.KV数据库.get('node_file_paths');
          currentPaths = currentPaths ? JSON.parse(currentPaths) : [];
          if (currentPaths.includes(newPath)) {
            return 创建JSON响应({ error: '该路径已存在' }, 400);
          }
          currentPaths.push(newPath);
          await env.KV数据库.put('node_file_paths', JSON.stringify(currentPaths));
          await 加载节点和配置(env, hostName);
          return 创建JSON响应({ success: true }, 200);

        case `/${配置路径}/remove-node-path`:
          const removeToken = 请求.headers.get('Cookie')?.split('=')[1];
          const 有效RemoveToken = await env.KV数据库.get('current_token');
          if (!removeToken || removeToken !== 有效RemoveToken) {
            return 创建JSON响应({ error: '未登录或Token无效' }, 401);
          }
          const removeData = await 请求.json();
          const index = removeData.index;
          let paths = await env.KV数据库.get('node_file_paths');
          paths = paths ? JSON.parse(paths) : [];
          if (index < 0 || index >= paths.length) {
            return 创建JSON响应({ error: '无效的索引' }, 400);
          }
          paths.splice(index, 1);
          await env.KV数据库.put('node_file_paths', JSON.stringify(paths));
          await 加载节点和配置(env, hostName);
          return 创建JSON响应({ success: true }, 200);

        case `/${配置路径}/get-node-paths`:
          const getToken = 请求.headers.get('Cookie')?.split('=')[1];
          const 有效GetToken = await env.KV数据库.get('current_token');
          if (!getToken || getToken !== 有效GetToken) {
            return 创建JSON响应({ error: '未登录或Token无效' }, 401);
          }
          let nodePaths = await env.KV数据库.get('node_file_paths');
          nodePaths = nodePaths ? JSON.parse(nodePaths) : ['https://v2.i-sweet.us.kg/ips.txt', 'https://v2.i-sweet.us.kg/url.txt'];
          return 创建JSON响应({ paths: nodePaths }, 200);

        case '/set-proxy-state':
          formData = await 请求.formData();
          const proxyEnabled = formData.get('proxyEnabled');
          const proxyType = formData.get('proxyType');
          const forceProxy = formData.get('forceProxy');
          await env.KV数据库.put('proxyEnabled', proxyEnabled);
          await env.KV数据库.put('proxyType', proxyType);
          await env.KV数据库.put('forceProxy', forceProxy);
          return new Response(null, { status: 200 });

        case '/get-proxy-status':
          const 代理启用 = await env.KV数据库.get('proxyEnabled') === 'true';
          const 代理类型 = await env.KV数据库.get('proxyType') || 'reverse';
          const 强制代理 = await env.KV数据库.get('forceProxy') === 'true';
          const 反代地址 = env.PROXYIP || 'ts.hpc.tw';
          const SOCKS5账号 = env.SOCKS5 || '';
          let status = '直连';
          if (代理启用) {
            if (强制代理) {
              status = 代理类型 === 'reverse' && 反代地址 ? '强制反代' : '强制SOCKS5';
            } else if (代理类型 === 'reverse' && 反代地址) {
              status = '动态反代';
            } else if (代理类型 === 'socks5' && SOCKS5账号) {
              status = '动态SOCKS5';
            }
          }
          return 创建JSON响应({ status });

        case '/set-b64-state':
          formData = await 请求.formData();
          const setB64Enabled = formData.get('b64Enabled');
          await env.KV数据库.put('b64Enabled', setB64Enabled);
          return new Response(null, { status: 200 });

        case '/get-b64-status':
          const b64状态 = await env.KV数据库.get('b64Enabled') === 'true';
          return 创建JSON响应({ b64Enabled: b64状态 });

        case `/${配置路径}/generate-cat-config`:
          const catToken = 请求.headers.get('Cookie')?.split('=')[1];
          const 有效CatToken = await env.KV数据库.get('current_token');
          if (!catToken || catToken !== 有效CatToken) {
            return 创建JSON响应({ error: '未登录或Token无效' }, 401);
          }
          try {
            await 加载节点和配置(env, hostName);
            const catConfig = await 生成猫咪(env, hostName);
            const 新版本 = String(Date.now());
            await env.KV数据库.put('config_' + atob('Y2xhc2g='), catConfig);
            await env.KV数据库.put('config_' + atob('Y2xhc2g=') + '_version', 新版本);
            return 创建JSON响应({ success: true });
          } catch (错误) {
            console.error(`生成猫咪配置失败: ${错误.message}`);
            return 创建JSON响应({ error: `生成猫咪配置失败: ${错误.message}` }, 500);
          }

        case `/${配置路径}/generate-universal-config`:
          const universalToken = 请求.headers.get('Cookie')?.split('=')[1];
          const 有效UniversalToken = await env.KV数据库.get('current_token');
          if (!universalToken || universalToken !== 有效UniversalToken) {
            return 创建JSON响应({ error: '未登录或Token无效' }, 401);
          }
          try {
            await 加载节点和配置(env, hostName);
            const universalConfig = await 生成通用(env, hostName);
            const 新版本 = String(Date.now());
            await env.KV数据库.put('config_' + atob('djJyYXk='), universalConfig);
            await env.KV数据库.put('config_' + atob('djJyYXk=') + '_version', 新版本);
            return 创建JSON响应({ success: true });
          } catch (错误) {
            console.error(`生成通用配置失败: ${错误.message}`);
            return 创建JSON响应({ error: `生成通用配置失败: ${错误.message}` }, 500);
          }

        default:
          url.hostname = 伪装域名;
          url.protocol = 'https:';
          return fetch(new Request(url, 请求));
      }
    } catch (error) {
      console.error(`全局错误: ${error.message}`);
      return 创建JSON响应({ error: `服务器内部错误: ${error.message}` }, 500);
    }
  }
};

// ====================== WebSocket处理 ======================
async function 升级请求(请求, env) {
  const 创建接口 = new WebSocketPair();
  const [客户端, 服务端] = Object.values(创建接口);
  服务端.accept();
  const uuid = await 获取或初始化UUID(env);
  const 结果 = await 解析头(解密(请求.headers.get('sec-websocket-protocol')), env, uuid);
  if (!结果) return new Response('Invalid request', { status: 400 });
  const { TCP接口, 初始数据 } = 结果;
  建立管道(服务端, TCP接口, 初始数据);
  return new Response(null, { status: 101, webSocket: 客户端 });
}

function 解密(混淆字符) {
  混淆字符 = 混淆字符.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(混淆字符), c => c.charCodeAt(0)).buffer;
}

async function 解析头(数据, env, uuid) {
  const 数据数组 = new Uint8Array(数据);
  if (验证密钥(数据数组.slice(1, 17)) !== uuid) return null;

  const 数据定位 = 数据数组[17];
  const 端口 = new DataView(数据.slice(18 + 数据定位 + 1, 20 + 数据定位 + 1)).getUint16(0);
  const 地址索引 = 20 + 数据定位 + 1;
  const 地址类型 = 数据数组[地址索引];
  let 地址 = '';
  const 地址信息索引 = 地址索引 + 1;

  switch (地址类型) {
    case 1: 地址 = new Uint8Array(数据.slice(地址信息索引, 地址信息索引 + 4)).join('.'); break;
    case 2:
      const 地址长度 = 数据数组[地址信息索引];
      地址 = new TextDecoder().decode(数据.slice(地址信息索引 + 1, 地址信息索引 + 1 + 地址长度));
      break;
    case 3:
      地址 = Array.from({ length: 8 }, (_, i) => new DataView(数据.slice(地址信息索引, 地址信息索引 + 16)).getUint16(i * 2).toString(16)).join(':');
      break;
    default: return null;
  }

  const 初始数据 = 数据.slice(地址信息索引 + (地址类型 === 2 ? 数据数组[地址信息索引] + 1 : 地址类型 === 1 ? 4 : 16));
  const TCP接口 = await 智能连接(地址, 端口, 地址类型, env);
  return { TCP接口, 初始数据 };
}

async function 智能连接(地址, 端口, 地址类型, env) {
  const 反代地址 = env.PROXYIP || 'ts.hpc.tw';
  const SOCKS5账号 = env.SOCKS5 || '';

  if (!地址 || 地址.trim() === '') {
    return await 尝试直连(地址, 端口);
  }

  const 是域名 = 地址类型 === 2 && !地址.match(/^\d+\.\d+\.\d+\.\d+$/);
  const 是IP = 地址类型 === 1 || (地址类型 === 2 && 地址.match(/^\d+\.\d+\.\d+\.\d+$/)) || 地址类型 === 3;

  if (是域名 || 是IP) {
    const 代理启用 = await env.KV数据库.get('proxyEnabled') === 'true';
    const 强制代理 = await env.KV数据库.get('forceProxy') === 'true';
    const 代理类型 = await env.KV数据库.get('proxyType') || 'reverse';

    if (!代理启用) {
      return await 尝试直连(地址, 端口);
    }

    if (强制代理) {
      if (代理类型 === 'reverse' && 反代地址) {
        try {
          const [反代主机, 反代端口] = 反代地址.split(':');
          const 连接 = connect({ hostname: 反代主机, port: 反代端口 || 端口 });
          await 连接.opened;
          console.log(`强制通过反代连接: ${反代地址}`);
          return 连接;
        } catch (错误) {
          console.error(`强制反代连接失败: ${错误.message}`);
          throw new Error(`强制反代失败: ${错误.message}`);
        }
      } else if (代理类型 === 'socks5' && SOCKS5账号) {
        try {
          const SOCKS5连接 = await 创建SOCKS5(地址类型, 地址, 端口);
          console.log(`强制通过 SOCKS5 连接: ${地址}:${端口}`);
          return SOCKS5连接;
        } catch (错误) {
          console.error(`强制 SOCKS5 连接失败: ${错误.message}`);
          throw new Error(`强制 SOCKS5 失败: ${错误.message}`);
        }
      }
    } else {
      try {
        const 连接 = await 尝试直连(地址, 端口);
        return 连接;
      } catch (错误) {
        console.log(`直连失败，动态切换到代理: ${错误.message}`);
        if (代理类型 === 'reverse' && 反代地址) {
          try {
            const [反代主机, 反代端口] = 反代地址.split(':');
            const 连接 = connect({ hostname: 反代主机, port: 反代端口 || 端口 });
            await 连接.opened;
            console.log(`动态通过反代连接: ${反代地址}`);
            return 连接;
          } catch (错误) {
            console.error(`动态反代连接失败: ${错误.message}`);
          }
        } else if (代理类型 === 'socks5' && SOCKS5账号) {
          try {
            const SOCKS5连接 = await 创建SOCKS5(地址类型, 地址, 端口);
            console.log(`动态通过 SOCKS5 连接: ${地址}:${端口}`);
            return SOCKS5连接;
          } catch (错误) {
            console.error(`动态 SOCKS5 连接失败: ${错误.message}`);
          }
        }
        throw new Error(`所有连接尝试失败: ${错误.message}`);
      }
    }
  }

  return await 尝试直连(地址, 端口);
}

async function 尝试直连(地址, 端口) {
  try {
    const 连接 = connect({ hostname: 地址, port: 端口 });
    await 连接.opened;
    console.log(`回退到直连: ${地址}:${端口}`);
    return 连接;
  } catch (错误) {
    console.error(`直连失败: ${错误.message}`);
    throw new Error(`无法连接: ${错误.message}`);
  }
}

function 验证密钥(arr) {
  return Array.from(arr.slice(0, 16), b => b.toString(16).padStart(2, '0')).join('').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/).slice(1).join('-').toLowerCase();
}

async function 建立管道(服务端, TCP接口, 初始数据) {
  await 服务端.send(new Uint8Array([0, 0]).buffer);
  const 数据流 = new ReadableStream({
    async start(控制器) {
      if (初始数据) 控制器.enqueue(初始数据);
      服务端.addEventListener('message', event => 控制器.enqueue(event.data));
      服务端.addEventListener('close', () => { 控制器.close(); TCP接口.close(); setTimeout(() => 服务端.close(1000), 2); });
      服务端.addEventListener('error', () => { 控制器.close(); TCP接口.close(); setTimeout(() => 服务端.close(1001), 2); });
    }
  });
  数据流.pipeTo(new WritableStream({
    async write(数据) {
      const 写入器 = TCP接口.writable.getWriter();
      await 写入器.write(数据);
      写入器.releaseLock();
    }
  }));
  TCP接口.readable.pipeTo(new WritableStream({
    async write(数据) {
      await 服务端.send(数据);
    }
  }));
}

async function 创建SOCKS5(地址类型, 地址, 端口) {
  const { username, password, hostname, port } = await 解析SOCKS5账号(SOCKS5账号);
  const SOCKS5接口 = connect({ hostname, port });
  try {
    await SOCKS5接口.opened;
  } catch {
    return new Response('SOCKS5未连通', { status: 400 });
  }
  const writer = SOCKS5接口.writable.getWriter();
  const reader = SOCKS5接口.readable.getReader();
  const encoder = new TextEncoder();
  await writer.write(new Uint8Array([5, 2, 0, 2]));
  let res = (await reader.read()).value;
  if (res[1] === 0x02) {
    if (!username || !password) return 关闭接口();
    await writer.write(new Uint8Array([1, username.length, ...encoder.encode(username), password.length, ...encoder.encode(password)]));
    res = (await reader.read()).value;
    if (res[0] !== 0x01 || res[1] !== 0x00) return 关闭接口();
  }
  let 转换地址;
  switch (地址类型) {
    case 1: 转换地址 = new Uint8Array([1, ...地址.split('.').map(Number)]); break;
    case 2: 转换地址 = new Uint8Array([3, 地址.length, ...encoder.encode(地址)]); break;
    case 3: 转换地址 = new Uint8Array([4, ...地址.split(':').flatMap(x => [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)])]); break;
    default: return 关闭接口();
  }
  await writer.write(new Uint8Array([5, 1, 0, ...转换地址, 端口 >> 8, 端口 & 0xff]));
  res = (await reader.read()).value;
  if (res[0] !== 0x05 || res[1] !== 0x00) return 关闭接口();
  writer.releaseLock();
  reader.releaseLock();
  return SOCKS5接口;

  function 关闭接口() {
    writer.releaseLock();
    reader.releaseLock();
    SOCKS5接口.close();
    return new Response('SOCKS5握手失败', { status: 400 });
  }
}

async function 解析SOCKS5账号(SOCKS5) {
  const [latter, former] = SOCKS5.split("@").reverse();
  let username, password, hostname, port;
  if (former) [username, password] = former.split(":");
  const latters = latter.split(":");
  port = Number(latters.pop());
  hostname = latters.join(":");
  return { username, password, hostname, port };
}

function 生成订阅页面(配置路径, hostName, uuid) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Comic Sans MS', 'Arial', sans-serif;
      color: #ff6f91;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      transition: background 0.5s ease;
    }
    @media (prefers-color-scheme: light) {
      body { background: linear-gradient(135deg, #ffe6f0, #fff0f5); }
      .card { background: rgba(255, 245, 247, 0.9); box-shadow: 0 8px 20px rgba(255, 182, 193, 0.3); }
      .card::before { border: 2px dashed #ffb6c1; }
      .card:hover { box-shadow: 0 10px 25px rgba(255, 182, 193, 0.5); }
      .link-box, .proxy-status, .uuid-box, .force-proxy-note { background: rgba(255, 240, 245, 0.9); border: 2px dashed #ffb6c1; }
      .file-item, .url-item { background: rgba(255, 245, 247, 0.9); }
      .upload-btn, .add-url-btn { background: linear-gradient(to right, #ffb6c1, #ff69b4); }
      .upload-label { background: linear-gradient(to right, #ffb6c1, #ff69b4); }
    }
    @media (prefers-color-scheme: dark) {
      body { background: linear-gradient(135deg, #1e1e2f, #2a2a3b); }
      .card { background: rgba(30, 30, 30, 0.9); color: #ffd1dc; box-shadow: 0 8px 20px rgba(255, 133, 162, 0.2); }
      .card::before { border: 2px dashed #ff85a2; }
      .card:hover { box-shadow: 0 10px 25px rgba(255, 133, 162, 0.4); }
      .link-box, .proxy-status, .uuid-box, .force-proxy-note { background: rgba(40, 40, 40, 0.9); border: 2px dashed #ff85a2; color: #ffd1dc; }
      .link-box a, .uuid-box span { color: #ff85a2; }
      .link-box a:hover { color: #ff1493; }
.file-item, .url-item { background: rgba(50, 50, 50, 0.9); color: #ffd1dc; }
.file-requirements { background: rgba(40, 40, 40, 0.9); border: 2px dashed #ff85a2; color: #ffd1dc; }
.file-requirements h3 { color: #ff85a2; }
.file-requirements .example { background: rgba(0, 0, 0, 0.3); }
.upload-btn, .add-url-btn { background: linear-gradient(to right, #ff85a2, #ff1493); }
.upload-label { background: linear-gradient(to right, #ff85a2, #ff1493); }
.force-proxy-note { background: rgba(40, 40, 40, 0.9) !important; border: 2px dashed #ff85a2 !important; color: #ffd1dc !important; }
    }
    .background-media {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -1;
      transition: opacity 0.5s ease;
    }
    .container {
      max-width: 900px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 25px;
      position: relative;
      z-index: 1;
      padding-bottom: 20px;
    }
    .card {
      border-radius: 25px;
      padding: 25px;
      width: 100%;
      max-width: 500px;
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      overflow: visible;
    }
    .card::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border-radius: 20px;
      z-index: -1;
    }
    .card:hover { transform: scale(1.03); }
    .card::after {
      content: '🎀';
      position: absolute;
      top: -20px;
      right: -20px;
      font-size: 60px;
      color: #ff69b4;
      transform: rotate(20deg);
      z-index: 1;
      text-shadow: 2px 2px 4px rgba(255, 105, 180, 0.3);
      pointer-events: none;
    }
    @media (prefers-color-scheme: dark) {
      .card::after { color: #ff85a2; text-shadow: 2px 2px 4px rgba(255, 133, 162, 0.3); }
    }
    .card-title {
      font-size: 1.6em;
      color: #ff69b4;
      margin-bottom: 15px;
      text-shadow: 1px 1px 3px rgba(255, 105, 180, 0.2);
    }
    .switch-container { display: flex; flex-direction: column; align-items: center; gap: 15px; }
    .toggle-row { display: flex; align-items: center; gap: 15px; }
    .toggle-switch { position: relative; display: inline-block; width: 60px; height: 34px; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    input:checked + .slider { background-color: #ff69b4; }
    input:checked + .slider:before { transform: translateX(26px); }
    .proxy-capsule { display: flex; border-radius: 20px; overflow: hidden; background: #ffe6f0; box-shadow: 0 4px 10px rgba(255, 182, 193, 0.2); }
    .proxy-option { width: 80px; padding: 10px 0; text-align: center; cursor: pointer; color: #ff6f91; transition: all 0.3s ease; position: relative; font-size: 1em; }
    .proxy-option.active { background: linear-gradient(to right, #ffb6c1, #ff69b4); color: white; box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1); }
    .proxy-option:not(.active):hover { background: #ffd1dc; }
    .proxy-option[data-type="socks5"].active { background: linear-gradient(to right, #ffd1dc, #ff85a2); }
    .proxy-option::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: rgba(255, 255, 255, 0.2); transform: rotate(30deg); transition: all 0.5s ease; pointer-events: none; }
    .proxy-option:hover::before { top: 100%; left: 100%; }
    .proxy-status, .uuid-box, .force-proxy-note { margin-top: 20px; padding: 8px 15px; border-radius: 15px; font-size: 0.95em; word-break: break-all; transition: background 0.3s ease, color 0.3s ease; width: 100%; box-sizing: border-box; }
    .proxy-status.success { background: rgba(212, 237, 218, 0.9); color: #155724; }
    .proxy-status.direct { background: rgba(233, 236, 239, 0.9); color: #495057; }
    .force-proxy-note { font-size: 0.9em; color: #ff85a2; border: 2px dashed #ffb6c1; }
.file-requirements { margin-top: 20px; padding: 15px; border-radius: 15px; background: rgba(255, 240, 245, 0.9); border: 2px dashed #ffb6c1; font-size: 0.9em; color: #d63384; transition: background 0.3s ease, color 0.3s ease; }
.file-requirements h3 { margin-top: 0; margin-bottom: 10px; color: #ff1493; font-size: 1.1em; }
.file-requirements ul { margin-bottom: 0; padding-left: 20px; }
.file-requirements li { margin-bottom: 5px; }
.file-requirements .example { font-family: monospace; background: rgba(255, 255, 255, 0.7); padding: 2px 5px; border-radius: 3px; }
    .link-box { border-radius: 15px; padding: 15px; margin: 10px 0; font-size: 0.95em; word-break: break-all; }
    .link-box a { color: #ff69b4; text-decoration: none; transition: color 0.3s ease; }
    .link-box a:hover { color: #ff1493; }
    .button-group { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 15px; }
    .cute-button {
      padding: 12px 25px;
      border-radius: 20px;
      border: none;
      font-size: 1em;
      font-family: 'Comic Sans MS', 'Arial', sans-serif;
      color: white;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-sizing: border-box;
      display: inline-block;
    }
    .cute-button:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(255, 105, 180, 0.4); }
    .cute-button:active { transform: scale(0.95); }
    .config1-btn { background: linear-gradient(to right, #ffb6c1, #ff69b4); }
    .config2-btn { background: linear-gradient(to right, #ffd1dc, #ff85a2); }
    .logout-btn { background: linear-gradient(to right, #ff9999, #ff6666); }
    .uuid-btn { background: linear-gradient(to right, #ffdead, #ff85a2); }
    .upload-btn, .add-url-btn {
      background: linear-gradient(to right, #ffdead, #ff85a2);
      margin-top: 5px;
    }
    .upload-title { font-size: 1.4em; color: #ff85a2; margin-bottom: 15px; }
    .upload-label { padding: 10px 20px; background: linear-gradient(to right, #ffb6c1, #ff69b4); color: white; border-radius: 20px; cursor: pointer; display: inline-block; transition: all 0.3s ease; margin-top: 10px; }
    .upload-label:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(255, 105, 180, 0.4); }
    .file-list, .url-list { margin: 15px 0; max-height: 120px; overflow-y: auto; text-align: left; }
    .file-item, .url-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-radius: 10px; margin: 5px 0; font-size: 0.9em; }
    .file-item button, .url-item button { background: #ff9999; border: none; border-radius: 15px; padding: 5px 10px; color: white; cursor: pointer; transition: background 0.3s ease; }
    .file-item button:hover, .url-item button:hover { background: #ff6666; }
    .progress-container { display: none; margin-top: 15px; }
    .progress-bar { width: 100%; height: 15px; background: #ffe6f0; border-radius: 10px; overflow: hidden; border: 1px solid #ffb6c1; }
    .progress-fill { height: 100%; background: linear-gradient(to right, #ff69b4, #ff1493); width: 0; transition: width 0.3s ease; }
    .progress-text { text-align: center; font-size: 0.85em; color: #ff6f91; margin-top: 5px; }
    .url-input {
      width: 100%;
      padding: 10px;
      border-radius: 15px;
      border: 2px solid #ffb6c1;
      font-size: 1em;
      box-sizing: border-box;
      margin-bottom: 10px;
    }
    @media (max-width: 600px) {
      .card { padding: 15px; max-width: 90%; }
      .card-title { font-size: 1.3em; }
      .switch-container { gap: 10px; }
      .toggle-row { gap: 10px; }
      .proxy-option { width: 70px; padding: 8px 0; font-size: 0.9em; }
      .proxy-status, .uuid-box, .force-proxy-note { font-size: 0.9em; padding: 8px 15px; }
      .link-box { font-size: 0.9em; padding: 12px; }
      .cute-button, .upload-label { padding: 10px 20px; font-size: 0.9em; }
      .card::after { font-size: 50px; top: -15px; right: -15px; }
      .url-input { font-size: 0.9em; }
      .button-group { gap: 8px; }
    }
  </style>
</head>
<body>
  <img id="backgroundImage" class="background-media">
  <div class="container">
    <div class="card">
      <h1 class="card-title">🌸樱花面板🌸</h1>
      <p style="font-size: 1em;">支持 <span style="color: #ff69b4;">${atob('Y2xhc2g=')}</span> 和 <span style="color: #ff85a2;">${atob('djJyYXluZw==')}</span> 哦~</p>
    </div>
    <div class="card">
      <h2 class="card-title">🔑 当前 UUID</h2>
      <div class="uuid-box">
        <span id="currentUUID">${uuid}</span>
      </div>
      <div class="button-group">
        <button class="cute-button uuid-btn" onclick="更换UUID()">更换 UUID</button>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">🌟 代理设置</h2>
      <div class="switch-container">
        <div class="toggle-row">
          <label>代理开关</label>
          <label class="toggle-switch">
            <input type="checkbox" id="proxyToggle" onchange="toggleProxy()">
            <span class="slider"></span>
          </label>
        </div>
        <div class="toggle-row" id="forceProxyRow" style="display: none;">
          <label>强制代理</label>
          <label class="toggle-switch">
            <input type="checkbox" id="forceProxyToggle" onchange="toggleForceProxy()">
            <span class="slider"></span>
          </label>
        </div>
        <div class="proxy-capsule" id="proxyCapsule">
          <div class="proxy-option active" data-type="reverse" onclick="switchProxyType('reverse')">反代</div>
          <div class="proxy-option" data-type="socks5" onclick="switchProxyType('socks5')">SOCKS5</div>
        </div>
      </div>
      <div class="proxy-status" id="proxyStatus">直连</div>
      <div class="force-proxy-note" id="forceProxyNote" style="display: none;">
        <span id="forceProxyText"></span>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">🔐 加密设置</h2>
      <div class="switch-container">
        <div class="toggle-row">
          <label>Base64加密</label>
          <label class="toggle-switch">
            <input type="checkbox" id="b64Toggle" onchange="toggleB64()">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="proxy-status" id="b64Status">当前订阅链接未加密</div>
    </div>
    <div class="card">
      <h2 class="upload-title">🌏 优选IP网络路径</h2>
      <div>
        <input type="text" id="nodeUrlInput" class="url-input" placeholder="输入节点文件 URL（如 https://example.com/ips.txt）">
        <button class="cute-button add-url-btn" onclick="添加节点路径()">添加路径</button>
        <div class="url-list" id="urlList"></div>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">🐾 猫咪订阅</h2>
      <div class="link-box">
        <p>订阅链接：<br><a href="https://${hostName}/${配置路径}/${atob('Y2xhc2g=')}">https://${hostName}/${配置路径}/${atob('Y2xhc2g=')}</a></p>
      </div>
      <div class="button-group">
        <button class="cute-button config2-btn" onclick="导入Config('${配置路径}', '${hostName}', '${atob('Y2xhc2g=')}')">一键导入</button>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">🐰 通用订阅</h2>
      <div class="link-box">
        <p>订阅链接：<br><a href="https://${hostName}/${配置路径}/${atob('djJyYXluZw==')}">https://${hostName}/${配置路径}/${atob('djJyYXluZw==')}</a></p>
      </div>
      <div class="button-group">
        <button class="cute-button config2-btn" onclick="导入Config('${配置路径}', '${hostName}', '${atob('djJyYXluZw==')}')">一键导入</button>
      </div>
    </div>
    <div class="card">
      <h2 class="upload-title">🌟 上传你的优选节点</h2>
      <div class="upload-notice force-proxy-note">
        <p>请上传包含优选IP或域名的.txt文件，每行一个节点</p>
      </div>
      <form id="uploadForm" action="/${配置路径}/upload" method="POST" enctype="multipart/form-data">
        <label for="ipFiles" class="upload-label">选择文件</label>
        <input type="file" id="ipFiles" name="ipFiles" accept=".txt" multiple required onchange="显示文件()" style="display: none;">
        <div class="file-list" id="fileList"></div>
        <button type="submit" class="cute-button upload-btn" onclick="开始上传(event)">上传</button>
        <div class="progress-container" id="progressContainer">
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div class="progress-text" id="progressText">0%</div>
        </div>
      </form>
    </div>
    <div class="card">
      <div class="button-group">
        <a href="/${配置路径}/logout" class="cute-button logout-btn">退出登录</a>
      </div>
    </div>
  </div>
  <script>
    const lightBg = '${白天背景图}';
    const darkBg = '${暗黑背景图}';
    const bgImage = document.getElementById('backgroundImage');

    function updateBackground() {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      bgImage.src = isDarkMode ? darkBg : lightBg;
      bgImage.onerror = () => { bgImage.style.display = 'none'; };
    }
    updateBackground();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateBackground);

    let proxyEnabled = localStorage.getItem('proxyEnabled') === 'true';
    let proxyType = localStorage.getItem('proxyType') || 'reverse';
    let forceProxy = localStorage.getItem('forceProxy') === 'true';
    let b64Enabled = localStorage.getItem('b64Enabled') === 'true';
    document.getElementById('proxyToggle').checked = proxyEnabled;
    document.getElementById('forceProxyToggle').checked = forceProxy;
    document.getElementById('b64Toggle').checked = b64Enabled;
    updateProxyUI();
    updateProxyStatus();
    updateB64Status();

    function 加载节点路径() {
      fetch('/${配置路径}/get-node-paths')
        .then(response => response.json())
        .then(data => {
          const urlList = document.getElementById('urlList');
          urlList.innerHTML = '';
          data.paths.forEach((path, index) => {
            const div = document.createElement('div');
            div.className = 'url-item';
            div.innerHTML = '<span>' + path + '</span><button onclick="移除节点路径(' + index + ')">移除</button>';
            urlList.appendChild(div);
          });
        })
        .catch(() => alert('加载节点路径失败，请稍后再试~'));
    }

    function 添加节点路径() {
      const urlInput = document.getElementById('nodeUrlInput');
      const url = urlInput.value.trim();
      if (!url) {
        alert('喂！大臭宝，请输入有效的 URL 哦~');
        return;
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL 必须以 http:// 或 https:// 开头哦~');
        return;
      }
      fetch('/${配置路径}/add-node-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: url })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            urlInput.value = '';
            加载节点路径();
            alert('路径添加成功！');
          } else {
            alert(data.error || '添加失败，请稍后再试~');
          }
        })
        .catch(() => alert('添加失败，网络出错啦~'));
    }

    function 移除节点路径(index) {
      fetch('/${配置路径}/remove-node-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            加载节点路径();
            alert('路径移除成功！');
          } else {
            alert(data.error || '移除失败，请稍后再试~');
          }
        })
        .catch(() => alert('移除失败，网络出错啦~'));
    }

    加载节点路径();

    function toggleProxy() {
      proxyEnabled = document.getElementById('proxyToggle').checked;
      localStorage.setItem('proxyEnabled', proxyEnabled);
      updateProxyUI();
      saveProxyState();
      updateProxyStatus();
    }

    function toggleForceProxy() {
      forceProxy = document.getElementById('forceProxyToggle').checked;
      localStorage.setItem('forceProxy', forceProxy);
      saveProxyState();
      updateProxyStatus();
      updateProxyUI();
    }

    function switchProxyType(type) {
      proxyType = type;
      localStorage.setItem('proxyType', proxyType);
      updateProxyUI();
      saveProxyState();
      updateProxyStatus();
    }

    function updateProxyUI() {
      const forceProxyRow = document.getElementById('forceProxyRow');
      const forceProxyNote = document.getElementById('forceProxyNote');
      const forceProxyText = document.getElementById('forceProxyText');
      const proxyCapsule = document.getElementById('proxyCapsule');
      const options = document.querySelectorAll('.proxy-option');

      forceProxyRow.style.display = proxyEnabled ? 'flex' : 'none';
      forceProxyNote.style.display = proxyEnabled ? 'block' : 'none';
      proxyCapsule.style.display = proxyEnabled ? 'flex' : 'none';
      options.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.type === proxyType);
      });

      if (proxyEnabled) {
        forceProxyText.textContent = forceProxy 
          ? '强制代理开启后，您的出口将固定为代理服务器的归属地。'
          : '动态代理将优先尝试直连，失败时自动切换至代理。';
      }
    }

    function updateProxyStatus() {
      const statusElement = document.getElementById('proxyStatus');
      if (!proxyEnabled) {
        statusElement.textContent = '直连';
        statusElement.className = 'proxy-status direct';
      } else {
        fetch('/get-proxy-status')
          .then(response => response.json())
          .then(data => {
            statusElement.textContent = data.status;
            statusElement.className = 'proxy-status ' + (data.status === '直连' ? 'direct' : 'success');
          })
          .catch(() => {
            statusElement.textContent = '直连';
            statusElement.className = 'proxy-status direct';
          });
      }
    }

    function toggleB64() {
      b64Enabled = document.getElementById('b64Toggle').checked;
      localStorage.setItem('b64Enabled', b64Enabled);
      saveB64State();
      updateB64Status();
      // 立即生成猫咪和通用配置并存入KV数据库
      generateAndSaveConfigs();
    }

    function generateAndSaveConfigs() {
      // 生成猫咪配置
      fetch('/${配置路径}/generate-cat-config', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('猫咪配置已生成并保存');
          } else {
            console.error('猫咪配置生成失败:', data.error);
          }
        })
        .catch(error => console.error('猫咪配置生成请求失败:', error));
      
      // 生成通用配置
      fetch('/${配置路径}/generate-universal-config', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('通用配置已生成并保存');
          } else {
            console.error('通用配置生成失败:', data.error);
          }
        })
        .catch(error => console.error('通用配置生成请求失败:', error));
    }

    function saveB64State() {
      const formData = new FormData();
      formData.append('b64Enabled', b64Enabled);
      fetch('/set-b64-state', { method: 'POST', body: formData })
        .then(() => updateB64Status());
    }

    function updateB64Status() {
      const statusElement = document.getElementById('b64Status');
      if (b64Enabled) {
        statusElement.textContent = '当前订阅链接已Base64加密';
        statusElement.className = 'proxy-status success';
      } else {
        statusElement.textContent = '当前订阅链接未加密';
        statusElement.className = 'proxy-status direct';
      }
    }

    function saveProxyState() {
      const formData = new FormData();
      formData.append('proxyEnabled', proxyEnabled);
      formData.append('proxyType', proxyType);
      formData.append('forceProxy', forceProxy);
      fetch('/set-proxy-state', { method: 'POST', body: formData })
        .then(() => updateProxyStatus());
    }

    function 导入Config(配置路径, hostName, type) {
      window.location.href = type + '://install-config?url=https://' + hostName + '/${配置路径}/' + type;
    }

    function 更换UUID() {
      fetch('/${配置路径}/change-uuid', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          if (data.uuid) {
            document.getElementById('currentUUID').textContent = data.uuid;
            alert('UUID 已更换成功！请重新获取订阅链接~');
          } else {
            alert('更换 UUID 失败，请稍后再试~');
          }
        })
        .catch(() => alert('更换 UUID 失败，网络出错啦~'));
    }

    function 显示文件() {
      const fileInput = document.getElementById('ipFiles');
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '';
      Array.from(fileInput.files).forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = '<span>' + file.name + ' (' + (file.size / 1024).toFixed(2) + ' KB)</span><button onclick="移除文件(' + index + ')">移除</button>';
        fileList.appendChild(div);
      });
    }

    function 移除文件(index) {
      const fileInput = document.getElementById('ipFiles');
      const dt = new DataTransfer();
      Array.from(fileInput.files).forEach((file, i) => { if (i !== index) dt.items.add(file); });
      fileInput.files = dt.files;
      显示文件();
    }

    function 开始上传(event) {
      event.preventDefault();
      const form = document.getElementById('uploadForm');
      const progressContainer = document.getElementById('progressContainer');
      const progressFill = document.getElementById('progressFill');
      const progressText = document.getElementById('progressText');
      const formData = new FormData(form);

      if (!formData.getAll('ipFiles').length) {
        alert('喂！大臭宝，请先选择文件哦~');
        return;
      }

      progressContainer.style.display = 'block';
      progressFill.style.width = '0%';
      progressText.textContent = '0%';

      const xhr = new XMLHttpRequest();
      xhr.open('POST', form.action, true);

      xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          progressFill.style.width = percentComplete + '%';
          progressText.textContent = Math.round(percentComplete) + '%';
        }
      };

      xhr.onload = function() {
        progressFill.style.width = '100%';
        progressText.textContent = '100%';
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status === 200) {
            if (response.message) {
              setTimeout(() => {
                alert(response.message);
                window.location.href = response.Location || '/${配置路径}';
              }, 500);
            } else {
              throw new Error('响应格式错误');
            }
          } else {
            throw new Error(response.error || '未知错误');
          }
        } catch (err) {
          progressContainer.style.display = 'none';
          alert('上传失败啦，状态码: ' + xhr.status + '，原因: ' + err.message);
        }
      };

      xhr.onerror = function() {
        progressContainer.style.display = 'none';
        alert('网络坏掉了，喂！大臭宝请检查一下哦~');
      };

      xhr.send(formData);
    }

    let lastUA = navigator.userAgent;
    function checkUAChange() {
      const currentUA = navigator.userAgent;
      if (currentUA !== lastUA) {
        console.log('UA 已切换，从', lastUA, '到', currentUA);
        lastUA = currentUA;
        adjustLayoutForUA();
      }
    }
    setInterval(checkUAChange, 500);

    function adjustLayoutForUA() {
      const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
      const container = document.querySelector('.container');
      const cards = document.querySelectorAll('.card');
      
      if (isMobile) {
        container.style.padding = '10px';
        cards.forEach(card => {
          card.style.maxWidth = '100%';
          card.style.padding = '15px';
        });
      } else {
        container.style.padding = '20px';
        cards.forEach(card => {
          card.style.maxWidth = '500px';
          card.style.padding = '25px';
        });
      }
    }
    adjustLayoutForUA();

    document.addEventListener('DOMContentLoaded', () => {
      updateProxyUI();
    });
  </script>
</body>
</html>
  `;
}

function 生成KV未绑定提示页面() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Comic Sans MS', 'Arial', sans-serif;
      color: #ff6f91;
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
      transition: background 0.5s ease;
    }
    @media (prefers-color-scheme: light) {
      body { background: linear-gradient(135deg, #ffe6f0, #fff0f5); }
      .content { background: rgba(255, 245, 247, 0.9); box-shadow: 0 8px 20px rgba(255, 182, 193, 0.3); }
    }
    @media (prefers-color-scheme: dark) {
      body { background: linear-gradient(135deg, #1e1e2f, #2a2a3b); }
      .content { background: rgba(30, 30, 30, 0.9); color: #ffd1dc; box-shadow: 0 8px 20px rgba(255, 133, 162, 0.2); }
    }
    .background-media {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -1;
      transition: opacity 0.5s ease;
    }
    .content {
      padding: 30px;
      border-radius: 25px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      position: relative;
      z-index: 1;
    }
    h1 {
      font-size: 1.8em;
      color: #ff69b4;
      text-shadow: 1px 1px 3px rgba(255, 105, 180, 0.2);
      margin-bottom: 20px;
    }
    p {
      font-size: 1.1em;
      line-height: 1.6;
      color: #ff85a2;
    }
    .highlight {
      color: #ff1493;
      font-weight: bold;
    }
    .instruction {
      margin-top: 20px;
      font-size: 1em;
      color: #ff69b4;
    }
    @media (max-width: 600px) {
      .content { padding: 20px; }
      h1 { font-size: 1.5em; }
      p { font-size: 0.95em; }
    }
  </style>
</head>
<body>
  <img id="backgroundImage" class="background-media">
  <div class="content">
    <h1>💔 哎呀，KV没绑定哦</h1>
    <p>喂！大臭宝，你的 <span class="highlight">Cloudflare KV 存储空间</span> 还没绑定呢~<br>快去 <span class="highlight">Cloudflare Workers</span> 设置里绑一个 KV 命名空间（变量名：<span class="highlight">KV数据库</span>），然后重新部署一下吧！</p>
    <div class="instruction">绑定好后 <span class="highlight">刷新界面</span> 就可以进入注册啦~</div>
  </div>
  <script>
    const lightBg = '${白天背景图}';
    const darkBg = '${暗黑背景图}';
    const bgImage = document.getElementById('backgroundImage');

    function updateBackground() {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      bgImage.src = isDarkMode ? darkBg : lightBg;
      bgImage.onerror = () => { bgImage.style.display = 'none'; };
    }
    updateBackground();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateBackground);

    let lastUA = navigator.userAgent;
    function checkUAChange() {
      const currentUA = navigator.userAgent;
      if (currentUA !== lastUA) {
        console.log('UA 已切换，从', lastUA, '到', currentUA);
        lastUA = currentUA;
      }
    }
    setInterval(checkUAChange, 500);
  </script>
</body>
</html>
  `;
}

async function 生成猫咪(env, hostName) {
  const uuid = await 获取或初始化UUID(env);
  const 节点列表 = 优选节点.length ? 优选节点 : [`${hostName}:443`];
  const b64Enabled = await env.KV数据库.get('b64Enabled') === 'true';
  const 国家分组 = {};

  节点列表.forEach((节点, 索引) => {
    const [主内容, tls] = 节点.split("@");
    const [地址端口, 节点名字 = 节点名称] = 主内容.split("#");
    const [, 地址, 端口 = "443"] = 地址端口.match(/^\[(.*?)\](?::(\d+))?$/) || 地址端口.match(/^(.*?)(?::(\d+))?$/);
    const 修正地址 = 地址.includes(":") ? 地址.replace(/^\[|\]$/g, '') : 地址;
    const TLS开关 = tls === 'notls' ? 'false' : 'true';
    const 国家 = 节点名字.split('-')[0] || '默认';
    const 地址类型 = 修正地址.includes(":") ? "IPv6" : "IPv4";

    国家分组[国家] = 国家分组[国家] || { IPv4: [], IPv6: [] };
    国家分组[国家][地址类型].push({
      name: `${节点名字}-${国家分组[国家][地址类型].length + 1}`,
      config: `- name: "${节点名字}-${国家分组[国家][地址类型].length + 1}"
  type: ${atob('dmxlc3M=')}
  server: ${修正地址}
  port: ${端口}
  uuid: ${uuid}
  udp: false
  tls: ${TLS开关}
  sni: ${hostName}
  network: ws
  ws-opts:
    path: "/?ed=2560"
    headers:
      Host: ${hostName}`
    });
  });

  const 国家列表 = Object.keys(国家分组).sort();
  const 节点配置 = 国家列表.flatMap(国家 => [...国家分组[国家].IPv4, ...国家分组[国家].IPv6].map(n => n.config)).join("\n");
  const 国家分组配置 = 国家列表.map(国家 => `
  - name: "${国家}"
    type: url-test
    url: "http://www.gstatic.com/generate_204"
    interval: 120
    tolerance: 50
    proxies:
${[...国家分组[国家].IPv4, ...国家分组[国家].IPv6].map(n => `      - "${n.name}"`).join("\n")}
`).join("");

  const 配置文本 = `# Generated at: ${new Date().toISOString()}
mixed-port: 7890
allow-lan: true
mode: Rule
log-level: info
external-controller: :9090
dns:
  enable: true
  listen: 0.0.0.0:53
  default-nameserver:
    - 8.8.8.8
    - 1.1.1.1
  enhanced-mode: fake-ip
  nameserver:
    - tls://8.8.8.8
    - tls://1.1.1.1
  fallback:
    - tls://9.9.9.9
    - tls://1.0.0.1
  fallback-filter:
    geoip: true
    ipcidr:
      - 240.0.0.0/4

proxies:
${节点配置}

proxy-groups:
  - name: "🚀节点选择"
    type: select
    proxies:
      - "🤪自动选择"
      - "🥰负载均衡"
${国家列表.map(国家 => `      - "${国家}"`).join("\n")}

  - name: "🤪自动选择"
    type: url-test
    url: "http://www.gstatic.com/generate_204"
    interval: 120
    tolerance: 50
    proxies:
${国家列表.map(国家 => `      - "${国家}"`).join("\n")}

  - name: "🥰负载均衡"
    type: load-balance
    strategy: round-robin
    proxies:
${国家列表.map(国家 => `      - "${国家}"`).join("\n")}

${国家分组配置}

rules:
  - GEOIP,LAN,DIRECT
  - DOMAIN-SUFFIX,cn,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,🚀节点选择
`;

  // 如果启用了Base64加密，则对整个配置文本进行Base64编码
  if (b64Enabled) {
    return btoa(unescape(encodeURIComponent(配置文本)));
  }
  return 配置文本;
}

async function 生成通用(env, hostName) {
  const uuid = await 获取或初始化UUID(env);
  const 节点列表 = 优选节点.length ? 优选节点 : [`${hostName}:443`];
  const b64Enabled = await env.KV数据库.get('b64Enabled') === 'true';
  const 配置列表 = 节点列表.map(节点 => {
    try {
      const [主内容, tls = 'tls'] = 节点.split("@");
      const [地址端口, 节点名字 = 节点名称] = 主内容.split("#");
      const match = 地址端口.match(/^(?:\[([0-9a-fA-F:]+)\]|([^:]+))(?:\:(\d+))?$/);
      if (!match) return null;
      const 地址 = match[1] || match[2];
      const 端口 = match[3] || "443";
      if (!地址) return null;
      const 修正地址 = 地址.includes(":") ? `[${地址}]` : 地址;
      const TLS开关 = tls === 'notls' ? 'none' : 'tls';
      const encodedPath = encodeURIComponent('/?ed=2560');
      return `${atob('dmxlc3M=')}://${uuid}@${修正地址}:${端口}?encryption=none&security=${TLS开关}&type=ws&host=${hostName}&path=${encodedPath}&sni=${hostName}#${节点名字}`;
    } catch (error) {
      console.error(`生成通用节点失败: ${节点}, 错误: ${error.message}`);
      return null;
    }
  }).filter(Boolean);

  const 配置文本 = `# Generated at: ${new Date().toISOString()}
${配置列表.length ? 配置列表.join("\n") : (atob('dmxlc3M=') + '://' + uuid + '@' + hostName + ':443?encryption=none&security=tls&type=ws&host=' + hostName + '&path=' + encodeURIComponent('/?ed=2560') + '&sni=' + hostName + '#默认节点')}`;
  
  // 如果启用了Base64加密，则对整个配置文本进行Base64编码
  if (b64Enabled) {
    return btoa(unescape(encodeURIComponent(配置文本)));
  }
  return 配置文本;
}