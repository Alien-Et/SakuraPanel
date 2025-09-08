// 认证工具模块

/**
 * 创建HTML响应
 * @param {string} html - HTML内容
 * @param {number} status - HTTP状态码
 * @returns {Response} HTML响应对象
 */
export function createHtmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

/**
 * 创建重定向响应
 * @param {string} url - 重定向URL
 * @param {number} status - HTTP状态码
 * @returns {Response} 重定向响应对象
 */
export function createRedirectResponse(url, status = 302) {
  return new Response(null, {
    status,
    headers: {
      'Location': url,
    },
  });
}

/**
 * 创建JSON响应
 * @param {Object} data - JSON数据
 * @param {number} status - HTTP状态码
 * @returns {Response} JSON响应对象
 */
export function createJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 生成UUID
 * @returns {string} UUID字符串
 */
export function generateUUID() {
  return crypto.randomUUID();
}

/**
 * 验证用户会话
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} uuid - 用户UUID
 * @returns {Promise<boolean>} 是否有效
 */
export async function validateUserSession(env, uuid) {
  try {
    // 从KV数据库获取用户会话信息
    const session = await env.KV数据库.get(`session_${uuid}`);
    
    if (!session) {
      return false;
    }
    
    const sessionData = JSON.parse(session);
    
    // 检查会话是否过期
    const now = Date.now();
    if (sessionData.expiresAt < now) {
      // 会话已过期，删除
      await env.KV数据库.delete(`session_${uuid}`);
      return false;
    }
    
    // 更新会话过期时间
    sessionData.expiresAt = now + (24 * 60 * 60 * 1000); // 24小时
    await env.KV数据库.put(`session_${uuid}`, JSON.stringify(sessionData));
    
    return true;
  } catch (error) {
    console.error('验证用户会话失败:', error);
    return false;
  }
}

/**
 * 创建用户会话
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} uuid - 用户UUID
 * @returns {Promise<boolean>} 是否成功创建
 */
export async function createUserSession(env, uuid) {
  try {
    const now = Date.now();
    const sessionData = {
      uuid,
      createdAt: now,
      expiresAt: now + (24 * 60 * 60 * 1000), // 24小时
      lastActivity: now
    };
    
    await env.KV数据库.put(`session_${uuid}`, JSON.stringify(sessionData));
    return true;
  } catch (error) {
    console.error('创建用户会话失败:', error);
    return false;
  }
}

/**
 * 删除用户会话
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} uuid - 用户UUID
 * @returns {Promise<boolean>} 是否成功删除
 */
export async function deleteUserSession(env, uuid) {
  try {
    await env.KV数据库.delete(`session_${uuid}`);
    return true;
  } catch (error) {
    console.error('删除用户会话失败:', error);
    return false;
  }
}

/**
 * 更新用户会话活动时间
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} uuid - 用户UUID
 * @returns {Promise<boolean>} 是否成功更新
 */
export async function updateUserSessionActivity(env, uuid) {
  try {
    const session = await env.KV数据库.get(`session_${uuid}`);
    
    if (!session) {
      return false;
    }
    
    const sessionData = JSON.parse(session);
    const now = Date.now();
    
    // 更新活动时间和过期时间
    sessionData.lastActivity = now;
    sessionData.expiresAt = now + (24 * 60 * 60 * 1000); // 24小时
    
    await env.KV数据库.put(`session_${uuid}`, JSON.stringify(sessionData));
    return true;
  } catch (error) {
    console.error('更新用户会话活动时间失败:', error);
    return false;
  }
}

/**
 * 获取用户会话信息
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} uuid - 用户UUID
 * @returns {Promise<Object>} 会话信息
 */
export async function getUserSessionInfo(env, uuid) {
  try {
    const session = await env.KV数据库.get(`session_${uuid}`);
    
    if (!session) {
      return null;
    }
    
    const sessionData = JSON.parse(session);
    
    // 检查会话是否过期
    const now = Date.now();
    if (sessionData.expiresAt < now) {
      // 会话已过期，删除
      await env.KV数据库.delete(`session_${uuid}`);
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('获取用户会话信息失败:', error);
    return null;
  }
}

/**
 * 检查锁定状态
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} ip - IP地址
 * @returns {Promise<Object>} 锁定状态对象
 */
export async function checkLock(env, ip) {
  try {
    // 获取锁定信息
    const lockInfo = await env.KV数据库.get(`lock:${ip}`);
    
    if (!lockInfo) {
      return { locked: false, attempts: 0 };
    }
    
    const lockData = JSON.parse(lockInfo);
    const now = Date.now();
    
    // 检查锁定是否已过期（默认5分钟）
    if (lockData.locked && lockData.lockUntil && now > lockData.lockUntil) {
      // 锁定已过期，重置
      await env.KV数据库.delete(`lock:${ip}`);
      return { locked: false, attempts: 0 };
    }
    
    return lockData;
  } catch (error) {
    console.error('检查锁定状态失败:', error);
    return { locked: false, attempts: 0 };
  }
}

/**
 * 记录失败尝试
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} ip - IP地址
 * @param {number} maxAttempts - 最大尝试次数
 * @param {number} lockDuration - 锁定持续时间（毫秒）
 * @returns {Promise<Object>} 更新后的锁定状态
 */
export async function recordFailedAttempt(env, ip, maxAttempts = 5, lockDuration = 5 * 60 * 1000) {
  try {
    // 获取当前锁定信息
    const lockInfo = await env.KV数据库.get(`lock:${ip}`);
    let lockData = lockInfo ? JSON.parse(lockInfo) : { attempts: 0, locked: false };
    
    // 增加尝试次数
    lockData.attempts += 1;
    
    // 检查是否需要锁定
    if (lockData.attempts >= maxAttempts) {
      lockData.locked = true;
      lockData.lockUntil = Date.now() + lockDuration;
    }
    
    // 保存更新后的锁定信息
    await env.KV数据库.put(`lock:${ip}`, JSON.stringify(lockData));
    
    return lockData;
  } catch (error) {
    console.error('记录失败尝试失败:', error);
    return { locked: false, attempts: 0 };
  }
}

/**
 * 重置锁定状态
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} ip - IP地址
 * @returns {Promise<boolean>} 是否成功重置
 */
export async function resetLock(env, ip) {
  try {
    await env.KV数据库.delete(`lock:${ip}`);
    return true;
  } catch (error) {
    console.error('重置锁定状态失败:', error);
    return false;
  }
}

/**
 * 生成登录注册页面
 * @param {string} lightBgUrl - 浅色主题背景图片URL
 * @param {string} darkBgUrl - 深色主题背景图片URL
 * @returns {string} HTML 内容
 */
export function generateLoginRegisterPage(lightBgUrl, darkBgUrl) {
  return `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登录/注册 - Sakura Panel</title>
    <style>
      /* 基础样式 */
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        transition: background 0.5s ease;
      }
      
      .dark body {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      }
      
      /* 主容器 */
      .auth-container {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        padding: 40px;
        width: 100%;
        max-width: 400px;
        text-align: center;
        transition: all 0.3s ease;
      }
      
      .dark .auth-container {
        background: rgba(30, 30, 30, 0.95);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      
      /* 标题 */
      .auth-title {
        color: #333;
        margin-bottom: 30px;
        font-size: 2rem;
        font-weight: 600;
      }
      
      .dark .auth-title {
        color: #fff;
      }
      
      /* 表单 */
      .auth-form {
        display: none;
      }
      
      .auth-form.active {
        display: block;
      }
      
      /* 输入组 */
      .input-group {
        margin-bottom: 20px;
        position: relative;
      }
      
      .input-group input {
        width: 100%;
        padding: 15px 45px 15px 15px;
        border: 2px solid #e1e1e1;
        border-radius: 10px;
        font-size: 16px;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.8);
      }
      
      .dark .input-group input {
        background: rgba(255, 255, 255, 0.1);
        border-color: #555;
        color: #fff;
      }
      
      .input-group input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      
      .dark .input-group input:focus {
        border-color: #764ba2;
        box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
      }
      
      /* 图标 */
      .input-icon {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
        cursor: pointer;
        user-select: none;
      }
      
      /* 按钮 */
      .auth-button {
        width: 100%;
        padding: 15px;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }
      
      .dark .auth-button {
        box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
      }
      
      .auth-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }
      
      .dark .auth-button:hover {
        box-shadow: 0 6px 20px rgba(118, 75, 162, 0.4);
      }
      
      .auth-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
      
      /* 切换链接 */
      .switch-link {
        display: block;
        margin-top: 20px;
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      
      .dark .switch-link {
        color: #764ba2;
      }
      
      .switch-link:hover {
        color: #5a6fd8;
        text-decoration: underline;
      }
      
      .dark .switch-link:hover {
        color: #6a4190;
      }
      
      /* 倒计时 */
      .countdown {
        color: #e74c3c;
        font-weight: 600;
        margin-top: 10px;
        display: none;
      }
      
      /* 主题切换 */
      .theme-toggle {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
      }
      
      .dark .theme-toggle {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .theme-toggle:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(15deg);
      }
      
      .dark .theme-toggle:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .theme-toggle i {
        font-size: 20px;
        color: #fff;
      }
      
      /* 响应式设计 */
      @media (max-width: 480px) {
        .auth-container {
          margin: 20px;
          padding: 30px 20px;
        }
        
        .auth-title {
          font-size: 1.5rem;
        }
      }
    </style>
  </head>
  <body>
    <!-- 主题切换按钮 -->
    <button class="theme-toggle" onclick="toggleTheme()">
      <i>🌙</i>
    </button>
    
    <div class="auth-container">
      <h1 class="auth-title">🌸 Sakura Panel</h1>
      
      <!-- 登录表单 -->
      <form class="auth-form active" id="loginForm" onsubmit="handleLogin(event)">
        <div class="input-group">
          <input type="text" id="loginUsername" placeholder="用户名" required minlength="3" maxlength="20">
          <span class="input-icon">👤</span>
        </div>
        
        <div class="input-group">
          <input type="password" id="loginPassword" placeholder="密码" required minlength="6" maxlength="50">
          <span class="input-icon" onclick="togglePasswordVisibility('loginPassword')">👁️</span>
        </div>
        
        <button type="submit" class="auth-button">登录</button>
        
        <div class="countdown" id="loginCountdown"></div>
        
        <a href="#" class="switch-link" onclick="switchToRegister()">没有账户？立即注册</a>
      </form>
      
      <!-- 注册表单 -->
      <form class="auth-form" id="registerForm" onsubmit="handleRegister(event)">
        <div class="input-group">
          <input type="text" id="registerUsername" placeholder="用户名" required minlength="3" maxlength="20">
          <span class="input-icon">👤</span>
        </div>
        
        <div class="input-group">
          <input type="password" id="registerPassword" placeholder="密码" required minlength="6" maxlength="50">
          <span class="input-icon" onclick="togglePasswordVisibility('registerPassword')">👁️</span>
        </div>
        
        <div class="input-group">
          <input type="password" id="confirmPassword" placeholder="确认密码" required minlength="6" maxlength="50">
          <span class="input-icon" onclick="togglePasswordVisibility('confirmPassword')">👁️</span>
        </div>
        
        <button type="submit" class="auth-button">注册</button>
        
        <div class="countdown" id="registerCountdown"></div>
        
        <a href="#" class="switch-link" onclick="switchToLogin()">已有账户？立即登录</a>
      </form>
    </div>
    
    <script>
      // 主题切换功能
      function toggleTheme() {
        document.documentElement.classList.toggle('dark');
        const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        
        // 更新主题切换按钮图标
        const themeToggle = document.querySelector('.theme-toggle i');
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
      
      // 切换到注册表单
      function switchToRegister() {
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.add('active');
      }
      
      // 切换到登录表单
      function switchToLogin() {
        document.getElementById('registerForm').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
      }
      
      // 切换密码可见性
      function togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.nextElementSibling;
        if (input.type === 'password') {
          input.type = 'text';
          icon.textContent = '🙈';
        } else {
          input.type = 'password';
          icon.textContent = '👁️';
        }
      }
      
      // 处理登录
      async function handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const button = document.querySelector('#loginForm .auth-button');
        const countdown = document.getElementById('loginCountdown');
        
        // 简单验证
        if (username.length < 3 || password.length < 6) {
          alert('用户名至少3位，密码至少6位');
          return;
        }
        
        // 禁用按钮并显示加载状态
        button.disabled = true;
        button.textContent = '登录中...';
        
        try {
          const response = await fetch('/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            // 登录成功，跳转到配置页面
            window.location.href = '/config';
          } else {
            // 登录失败，显示错误信息
            alert(data.message || '登录失败');
            
            // 如果有倒计时，启动倒计时
            if (data.countdown) {
              startCountdown(countdown, data.countdown);
              button.disabled = true;
            }
          }
        } catch (error) {
          console.error('登录请求失败:', error);
          alert('登录请求失败，请稍后再试');
        } finally {
          // 恢复按钮状态
          if (!button.disabled) {
            button.disabled = false;
            button.textContent = '登录';
          }
        }
      }
      
      // 处理注册
      async function handleRegister(event) {
        event.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const button = document.querySelector('#registerForm .auth-button');
        const countdown = document.getElementById('registerCountdown');
        
        // 简单验证
        if (username.length < 3) {
          alert('用户名至少3位');
          return;
        }
        
        if (password.length < 6) {
          alert('密码至少6位');
          return;
        }
        
        if (password !== confirmPassword) {
          alert('两次输入的密码不一致');
          return;
        }
        
        // 禁用按钮并显示加载状态
        button.disabled = true;
        button.textContent = '注册中...';
        
        try {
          const response = await fetch('/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            // 注册成功，跳转到配置页面
            window.location.href = '/config';
          } else {
            // 注册失败，显示错误信息
            alert(data.message || '注册失败');
            
            // 如果有倒计时，启动倒计时
            if (data.countdown) {
              startCountdown(countdown, data.countdown);
              button.disabled = true;
            }
          }
        } catch (error) {
          console.error('注册请求失败:', error);
          alert('注册请求失败，请稍后再试');
        } finally {
          // 恢复按钮状态
          if (!button.disabled) {
            button.disabled = false;
            button.textContent = '注册';
          }
        }
      }
      
      // 启动倒计时
      function startCountdown(element, seconds) {
        element.style.display = 'block';
        ;element.textContent = '请在 ' + seconds + ' 秒后重试';
        
        const interval = setInterval(() => {
          seconds--;
          if (seconds > 0) {
            element.textContent = '请在 ' + seconds + ' 秒后重试';
          } else {
            clearInterval(interval);
            element.style.display = 'none';
            // 启用所有表单按钮
            document.querySelectorAll('.auth-button').forEach(btn => {
              btn.disabled = false;
              btn.textContent = btn.id === 'loginForm' ? '登录' : '注册';
            });
          }
        }, 1000);
      }
      
      // 页面加载时初始化主题
      document.addEventListener('DOMContentLoaded', () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.querySelector('.theme-toggle i').textContent = '☀️';
        }
      });
    </script>
  </body>
  </html>`;
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