// 认证工具模块

/**
 * 检查设备锁定状态
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} 设备标识 - 唯一标识设备的字符串
 * @param {number} 锁定时间 - 锁定时长（毫秒）
 * @returns {Object} 锁定状态信息
 */
export async function checkLock(env, 设备标识, 锁定时间) {
  const 锁定时间戳 = await env.KV数据库.get(`lock_${设备标识}`);
  const 当前时间 = Date.now();
  const 被锁定 = 锁定时间戳 && 当前时间 < Number(锁定时间戳);
  return {
    被锁定,
    剩余时间: 被锁定 ? Math.ceil((Number(锁定时间戳) - 当前时间) / 1000) : 0
  };
}

/**
 * 生成登录注册界面
 * @param {string} 类型 - '登录' 或 '注册'
 * @param {Object} 额外参数 - 额外的界面参数
 * @param {string} 白天背景图 - 白天模式背景图URL
 * @param {string} 暗黑背景图 - 暗黑模式背景图URL
 * @returns {string} HTML 内容
 */
export function generateLoginRegisterPage(类型, 额外参数 = {}, 白天背景图, 暗黑背景图) {
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
      .auth-container { background: rgba(255, 245, 247, 0.9); box-shadow: 0 8px 20px rgba(255, 182, 193, 0.3); }
    }
    @media (prefers-color-scheme: dark) {
      body { background: linear-gradient(135deg, #1e1e2f, #2a2a3b); }
      .auth-container { background: rgba(30, 30, 30, 0.9); color: #ffd1dc; box-shadow: 0 8px 20px rgba(255, 133, 162, 0.2); }
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
    .auth-container {
      padding: 30px;
      border-radius: 25px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      position: relative;
      z-index: 1;
    }
    h1 {
      font-size: 1.8em;
      color: #ff69b4;
      margin-bottom: 20px;
      text-shadow: 1px 1px 3px rgba(255, 105, 180, 0.2);
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
    }
    .auth-form input {
      padding: 12px;
      border-radius: 15px;
      border: 2px solid #ffb6c1;
      font-size: 1em;
      width: 100%;
      box-sizing: border-box;
    }
    .auth-form button {
      padding: 12px;
      background: linear-gradient(to right, #ffb6c1, #ff69b4);
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 1em;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .auth-form button:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 15px rgba(255, 105, 180, 0.4);
    }
    .auth-form button:active {
      transform: scale(0.95);
    }
    .auth-form button:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }
    .error-message {
      color: #ff6666;
      margin-top: 15px;
      font-size: 0.9em;
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
    }
    @media (max-width: 600px) {
      .auth-container { padding: 20px; }
      h1 { font-size: 1.5em; }
      .auth-form input, .auth-form button { padding: 10px; font-size: 0.95em; }
    }
  </style>
</head>
<body>
  <img id="backgroundImage" class="background-media">
  <div class="auth-container">
    <h1>${界面数据[类型].title}</h1>
    ${界面数据[类型].表单}
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

    // 倒计时逻辑
    let remainingTime = ${额外参数.锁定状态 ? 额外参数.剩余时间 : 0};
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

    if (${额外参数.锁定状态}) {
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
  </script>
</body>
</html>
  `;
}

/**
 * 加密密码
 * @param {string} 密码 - 要加密的密码
 * @returns {Promise<string>} 加密后的密码哈希值
 */
export async function encryptPassword(密码) {
  const encoder = new TextEncoder();
  const data = encoder.encode(密码);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}