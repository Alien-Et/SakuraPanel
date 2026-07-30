// ====================== 花瓣飘落效果 - 共享模块 ======================
export const 容器HTML = `<div class="floating-petals" id="petalsContainer"></div>`;

export const 样式 = `
    .floating-petals {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
      overflow: visible;
    }
    .petal {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50% 0;
      opacity: 0;
      animation: float linear infinite;
    }
    @keyframes float {
      0% {
        transform: translateY(0) translateX(0) rotate(0deg);
        opacity: 0;
      }
      10% { opacity: 0.7; }
      25% { transform: translateY(25vh) translateX(-25px) rotate(90deg); }
      50% { transform: translateY(50vh) translateX(25px) rotate(180deg); }
      75% { transform: translateY(75vh) translateX(-25px) rotate(270deg); }
      90% { opacity: 0.7; }
      100% {
        transform: translateY(100vh) translateX(0) rotate(360deg);
        opacity: 0;
      }
    }
`;

export const 脚本 = `
    // 创建漂浮花瓣效果
    function createPetal() {
      const petalsContainer = document.getElementById('petalsContainer');
      if (!petalsContainer) return;
      const petal = document.createElement('div');
      petal.className = 'petal';
      const colors = ['#ffb6c1', '#ff69b4', '#ffc0cb', '#ff1493', '#ffd1dc'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 15 + 5;
      const left = Math.random() * 100;
      const duration = Math.random() * 10 + 10;
      petal.style.backgroundColor = color;
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';
      petal.style.left = left + '%';
      petal.style.animationDuration = duration + 's';
      petalsContainer.appendChild(petal);
      setTimeout(() => {
        petal.remove();
      }, duration * 1000);
    }
    setInterval(createPetal, 500);
    for (let i = 0; i < 20; i++) {
      setTimeout(createPetal, i * 200);
    }
`;
