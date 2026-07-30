// ====================== KV未绑定提示界面 - 脚本 ======================
import { 脚本 as 花瓣脚本 } from '../界面_主题/花瓣效果.js';

export function 生成脚本(参数) {
  const { 默认白天背景图, 默认暗黑背景图 } = 参数;
  return `
    const lightBg = '${默认白天背景图}';
    const darkBg = '${默认暗黑背景图}';
    const bgImage = document.getElementById('backgroundImage');

    // KV未绑定时直接使用默认壁纸，无需调用API
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

    ${花瓣脚本}
  `;
}
