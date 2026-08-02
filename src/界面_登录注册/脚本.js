// ====================== 登录/注册界面 - 脚本 ======================
import { 脚本 as 花瓣脚本 } from '../界面_主题/花瓣效果.js';

export function 生成脚本(参数) {
  const { 默认白天背景图, 默认暗黑背景图, 锁定状态, 剩余时间 } = 参数;
  return `
    // 背景图片切换
    const lightBg = '${默认白天背景图}';
    const darkBg = '${默认暗黑背景图}';
    const bgImage = document.getElementById('backgroundImage');

    async function 获取壁纸地址() {
      try {
        const response = await fetch('/get-wallpaper-public');
        if (response.ok) {
          const data = await response.json();
          return {
            light: data.lightWallpaper || '${默认白天背景图}',
            dark: data.darkWallpaper || '${默认暗黑背景图}'
          };
        }
      } catch (error) {
        console.error('获取壁纸地址失败:', error);
      }
      return {
        light: '${默认白天背景图}',
        dark: '${默认暗黑背景图}'
      };
    }

    async function updateBackground() {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const wallpaper = await 获取壁纸地址();
      bgImage.src = isDarkMode ? wallpaper.dark : wallpaper.light;
      bgImage.onerror = () => { bgImage.style.display = 'none'; };
    }
    updateBackground();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateBackground);

    // 倒计时逻辑
    let remainingTime = ${锁定状态 ? 剩余时间 : 0};
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

    if (${!!锁定状态}) {
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

    ${花瓣脚本}
  `;
}
