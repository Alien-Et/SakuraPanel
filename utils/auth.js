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
          <div class="input-group">
            <input type="text" name="username" placeholder="设置账号" required pattern="^[a-zA-Z0-9]{4,20}$" title="4-20位字母数字">
            <span class="input-icon">👤</span>
          </div>
          <div class="input-group">
            <input type="password" name="password" placeholder="设置密码" required minlength="6">
            <span class="input-icon">🔒</span>
            <button type="button" class="toggle-password" onclick="togglePasswordVisibility(this)">👁️</button>
          </div>
          <div class="input-group">
            <input type="password" name="confirm" placeholder="确认密码" required>
            <span class="input-icon">🔒</span>
            <button type="button" class="toggle-password" onclick="togglePasswordVisibility(this)">👁️</button>
          </div>
          <button type="submit">立即注册</button>
          <div class="auth-links">
            <span>已有账号？</span>
            <a href="/login">前往登录</a>
          </div>
        </form>
        ${额外参数.错误信息 ? `<div class="error-message">${额外参数.错误信息}</div>` : ''}
        ${额外参数.注册成功 ? `<div class="success-message">${额外参数.注册成功}</div>` : ''}
      `
    },
    登录: {
      title: '🌸欢迎回来🌸',
      表单: `
        <form class="auth-form" action="/login/submit" method="POST" enctype="application/x-www-form-urlencoded">
          <div class="input-group">
            <input type="text" name="username" placeholder="登录账号" required>
            <span class="input-icon">👤</span>
          </div>
          <div class="input-group">
            <input type="password" name="password" placeholder="登录密码" required>
            <span class="input-icon">🔒</span>
            <button type="button" class="toggle-password" onclick="togglePasswordVisibility(this)">👁️</button>
          </div>
          <div class="remember-me">
            <input type="checkbox" id="rememberMe" name="rememberMe">
            <label for="rememberMe">记住我</label>
          </div>
          <button type="submit" id="loginButton" ${额外参数.锁定状态 ? 'disabled' : ''}>立即登录</button>
          <div class="auth-links">
            <span>还没有账号？</span>
            <a href="/register">立即注册</a>
          </div>
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
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🌸樱花代理 - ${类型}</title>
  <style>
    /* 基础样式 */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    }
    
    body {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
      transition: background-image 0.5s ease;
    }
    
    /* 背景图片 */
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
    
    /* 主题切换按钮 */
    .toggle-theme {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      transition: background 0.3s, transform 0.3s;
      z-index: 1000;
    }
    
    .toggle-theme:hover {
      background: rgba(255, 255, 255, 0.5);
      transform: scale(1.1);
    }
    
    /* 认证容器 */
    .auth-container {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 25px;
      padding: 40px;
      max-width: 450px;
      width: 90%;
      text-align: center;
      position: relative;
      z-index: 1;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.3s ease;
    }
    
    .auth-container:hover {
      transform: translateY(-5px);
    }
    
    /* 标题样式 */
    h1 {
      font-size: 2em;
      color: #ff69b4;
      margin-bottom: 30px;
      text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
    }
    
    /* 表单样式 */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 100%;
    }
    
    .input-group {
      position: relative;
      width: 100%;
    }
    
    .auth-form input {
      width: 100%;
      padding: 15px 20px 15px 45px;
      border-radius: 15px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      transition: all 0.3s ease;
      outline: none;
    }
    
    .auth-form input:focus {
      border-color: #ff69b4;
      box-shadow: 0 0 15px rgba(255, 105, 180, 0.2);
      transform: translateY(-2px);
    }
    
    .input-icon {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: #666;
      pointer-events: none;
    }
    
    .toggle-password {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    
    .toggle-password:hover {
      transform: translateY(-50%) scale(1.1);
    }
    
    /* 记住我选项 */
    .remember-me {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: 5px;
    }
    
    .remember-me input[type="checkbox"] {
      width: auto;
      margin: 0;
      cursor: pointer;
    }
    
    .remember-me label {
      cursor: pointer;
      color: #333;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
    }
    
    /* 按钮样式 */
    .auth-form button[type="submit"] {
      padding: 15px;
      background: linear-gradient(135deg, #ff6b6b, #ff69b4);
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
      outline: none;
    }
    
    .auth-form button[type="submit"]:hover:not(:disabled) {
      transform: scale(1.03);
      box-shadow: 0 5px 15px rgba(255, 105, 180, 0.4);
    }
    
    .auth-form button[type="submit"]:active:not(:disabled) {
      transform: scale(0.98);
    }
    
    .auth-form button[type="submit"]:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    /* 链接样式 */
    .auth-links {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      font-size: 14px;
    }
    
    .auth-links a {
      color: #ff69b4;
      text-decoration: none;
      font-weight: bold;
      transition: all 0.3s ease;
    }
    
    .auth-links a:hover {
      text-decoration: underline;
      color: #ff1493;
    }
    
    /* 消息提示样式 */
    .error-message {
      color: #ff6666;
      background: rgba(255, 102, 102, 0.1);
      padding: 12px;
      border-radius: 10px;
      margin-top: 15px;
      font-size: 14px;
      border-left: 4px solid #ff6666;
    }
    
    .success-message {
      color: #4CAF50;
      background: rgba(76, 175, 80, 0.1);
      padding: 12px;
      border-radius: 10px;
      margin-top: 15px;
      font-size: 14px;
      border-left: 4px solid #4CAF50;
    }
    
    .lock-message {
      color: #ff6666;
      background: rgba(255, 102, 102, 0.1);
      padding: 15px;
      border-radius: 10px;
      margin-top: 20px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-left: 4px solid #ff6666;
    }
    
    #countdown {
      color: #ff1493;
      font-weight: bold;
      min-width: 50px;
      text-align: center;
      font-size: 16px;
    }
    
    /* 加载动画 */
    .loading {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #ff69b4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* 响应式设计 */
    @media (max-width: 600px) {
      .auth-container {
        padding: 25px;
        margin: 20px;
      }
      
      h1 {
        font-size: 1.6em;
        margin-bottom: 25px;
      }
      
      .auth-form input,
      .auth-form button {
        padding: 12px;
        font-size: 14px;
      }
      
      .toggle-theme {
        width: 40px;
        height: 40px;
        font-size: 20px;
        top: 10px;
        right: 10px;
      }
    }
    
    /* 动画效果 */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .auth-container {
      animation: fadeIn 0.8s ease-out;
    }
    
    /* 输入框焦点状态 */
    .input-group:focus-within .input-icon {
      color: #ff69b4;
      transform: translateY(-50%) scale(1.1);
    }
  </style>
</head>
<body id="auth-page">
  <img id="backgroundImage" class="background-media">
  <button class="toggle-theme" id="theme-toggle">🌙</button>
  <div class="auth-container">
    <h1>${界面数据[类型].title}</h1>
    ${界面数据[类型].表单}
  </div>
  <script>
    const lightBg = '${白天背景图}';
    const darkBg = '${暗黑背景图}';
    const bgImage = document.getElementById('backgroundImage');
    const themeToggle = document.getElementById('theme-toggle');
    const authPage = document.getElementById('auth-page');

    // 初始化主题
    function initTheme() {
      // 检查是否有保存的主题设置
      const savedTheme = localStorage.getItem('authTheme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
      
      // 应用主题
      applyTheme(currentTheme);
    }
    
    // 应用主题
    function applyTheme(theme) {
      if (theme === 'dark') {
        authPage.style.backgroundImage = 'url(' + darkBg + ')';
        themeToggle.textContent = '☀️';
      } else {
        authPage.style.backgroundImage = 'url(' + lightBg + ')';
        themeToggle.textContent = '🌙';
      }
      
      // 处理图片加载失败
      bgImage.onerror = () => {
        // 如果背景图加载失败，使用渐变背景
        if (theme === 'dark') {
          authPage.style.backgroundImage = 'linear-gradient(135deg, #1e1e2f, #2a2a3b)';
        } else {
          authPage.style.backgroundImage = 'linear-gradient(135deg, #ffe6f0, #fff0f5)';
        }
      };
      
      // 保存主题设置
      localStorage.setItem('authTheme', theme);
    }
    
    // 切换主题事件
    themeToggle.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('authTheme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
    
    // 密码可见性切换
    function togglePasswordVisibility(button) {
      const input = button.previousElementSibling.previousElementSibling;
      const icon = button;
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '👁️‍🗨️';
      } else {
        input.type = 'password';
        icon.textContent = '👁️';
      }
    }
    
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
          if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerHTML = '立即登录';
          }
          const lockMessage = document.querySelector('.lock-message');
          if (lockMessage) {
            lockMessage.innerHTML = '锁定已解除，请重新尝试登录';
            lockMessage.classList.add('success-message');
            lockMessage.classList.remove('error-message');
          }
          fetch('/reset-login-failures', { method: 'POST' });
          return;
        }
        countdownElement.textContent = remainingTime;
        remainingTime--;
      }, 1000);
    }

    // 与服务器同步锁定状态
    function syncWithServer() {
      fetch('/check-lock')
        .then(response => response.json())
        .then(data => {
          if (data.locked) {
            remainingTime = data.remainingTime;
            if (countdownElement) countdownElement.textContent = remainingTime;
            if (loginButton) loginButton.disabled = true;
          } else {
            remainingTime = 0;
            if (countdownElement) countdownElement.textContent = '0';
            if (loginButton) loginButton.disabled = false;
            const lockMessage = document.querySelector('.lock-message');
            if (lockMessage) {
              lockMessage.innerHTML = '锁定已解除，请重新尝试登录';
              lockMessage.classList.add('success-message');
              lockMessage.classList.remove('error-message');
            }
          }
        })
        .catch(error => {
          console.error('同步锁定状态失败:', error);
        });
    }

    // 表单提交前的客户端验证
    function setupFormValidation() {
      const form = document.querySelector('.auth-form');
      if (!form) return;
      
      form.addEventListener('submit', function(event) {
        // 阻止非用户触发的表单提交
        if (!event.isTrusted) {
          event.preventDefault();
          console.log('阻止非用户触发的表单提交');
          return;
        }
        
        // 获取密码字段
        const password = form.querySelector('input[name="password"]');
        const confirm = form.querySelector('input[name="confirm"]');
        
        // 密码验证
        if (password && password.value.length < 6) {
          event.preventDefault();
          showError('密码长度至少为6位');
          return;
        }
        
        // 确认密码验证
        if (confirm && password.value !== confirm.value) {
          event.preventDefault();
          showError('两次输入的密码不一致');
          return;
        }
        
        // 禁用提交按钮防止重复提交
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.innerHTML = '<span class="loading"></span> 处理中...';
        }
      });
    }
    
    // 显示错误信息
    function showError(message) {
      let errorElement = document.querySelector('.error-message');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        const form = document.querySelector('.auth-form');
        if (form) {
          form.parentNode.insertBefore(errorElement, form.nextSibling);
        }
      }
      errorElement.textContent = message;
      
      // 3秒后自动消失
      setTimeout(() => {
        if (errorElement) {
          errorElement.style.opacity = '0';
          errorElement.style.transition = 'opacity 0.5s ease';
          setTimeout(() => {
            if (errorElement.parentNode) errorElement.parentNode.removeChild(errorElement);
          }, 500);
        }
      }, 3000);
    }
    
    // 监听 UA 变化并平滑处理
    let lastUA = navigator.userAgent;
    function checkUAChange() {
      const currentUA = navigator.userAgent;
      if (currentUA !== lastUA) {
        console.log('UA 已切换，从', lastUA, '到', currentUA);
        lastUA = currentUA;
        // 可以在这里添加额外的安全处理逻辑
      }
    }
    
    // 键盘事件处理
    function setupKeyboardEvents() {
      document.addEventListener('keydown', function(event) {
        // 按Enter键提交表单
        if (event.key === 'Enter') {
          const activeElement = document.activeElement;
          if (activeElement && activeElement.tagName !== 'BUTTON' && activeElement.tagName !== 'TEXTAREA') {
            const submitButton = document.querySelector('button[type="submit"]');
            if (submitButton && !submitButton.disabled) {
              submitButton.click();
            }
          }
        }
      });
    }
    
    // 页面加载完成后初始化
    window.addEventListener('load', () => {
      initTheme();
      setupFormValidation();
      setupKeyboardEvents();
      
      // 设置定期检查UA变化
      setInterval(checkUAChange, 500);
      
      // 如果有锁定状态，启动倒计时
      if (${额外参数.锁定状态}) {
        startCountdown();
        // 定期同步锁定状态
        setInterval(syncWithServer, 10000);
        // 页面可见性变化时同步状态
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            syncWithServer();
          }
        });
      }
    });
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