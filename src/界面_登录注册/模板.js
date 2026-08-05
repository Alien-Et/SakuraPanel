import { 默认白天背景图, 默认暗黑背景图 } from '../常量.js';
import { 样式 } from './样式.js';
import { 生成脚本 } from './脚本.js';
import { 容器HTML as 花瓣容器HTML } from '../界面_主题/花瓣效果.js';

// ====================== 登录/注册界面 - 模板 ======================
export function 生成登录注册界面(类型, 额外参数 = {}, 页面标题) {
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

  const 页面标题文本 = 页面标题 || (类型 === '登录' ? '欢迎登录' : '注册新账号');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${页面标题文本}</title>
  <style>${样式}</style>
</head>
<body>
  <img id="backgroundImage" class="background-media">
  ${花瓣容器HTML}
  <div class="auth-container">
    <div class="cute-icon">🌸</div>
    <div class="cute-icon">🌺</div>
    <h1>${界面数据[类型].title}</h1>
    ${界面数据[类型].表单}
    <div class="powered-by">由 <a href="https://github.com/Alien-Et/SakuraPanel" target="_blank" rel="noopener noreferrer">SakuraPanel</a> 项目驱动</div>
  </div>

  <script>${生成脚本({
    默认白天背景图,
    默认暗黑背景图,
    锁定状态: 额外参数.锁定状态,
    剩余时间: 额外参数.剩余时间
  })}</script>
</body>
</html>
  `;
}
