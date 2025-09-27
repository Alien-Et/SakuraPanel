var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _worker.js
import { connect } from "cloudflare:sockets";
var \u914D\u7F6E\u8DEF\u5F84 = "config";
var \u4F18\u9009\u8282\u70B9 = [];
var \u53CD\u4EE3\u5730\u5740 = "ProxyIP.JP.CMLiussss.net";
var SOCKS5\u8D26\u53F7 = "";
var \u8282\u70B9\u540D\u79F0 = "\u{1F338}\u6A31\u82B1";
var \u4F2A\u88C5\u57DF\u540D = "lkssite.vip";
var \u6700\u5927\u5931\u8D25\u6B21\u6570 = 5;
var \u9501\u5B9A\u65F6\u95F4 = 5 * 60 * 1e3;
function \u521B\u5EFAHTML\u54CD\u5E94(\u5185\u5BB9, \u72B6\u6001\u7801 = 200) {
  return new Response(\u5185\u5BB9, {
    status: \u72B6\u6001\u7801,
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
    }
  });
}
__name(\u521B\u5EFAHTML\u54CD\u5E94, "\u521B\u5EFAHTML\u54CD\u5E94");
function \u521B\u5EFA\u91CD\u5B9A\u5411\u54CD\u5E94(\u8DEF\u5F84, \u989D\u5916\u5934 = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": \u8DEF\u5F84,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...\u989D\u5916\u5934
    }
  });
}
__name(\u521B\u5EFA\u91CD\u5B9A\u5411\u54CD\u5E94, "\u521B\u5EFA\u91CD\u5B9A\u5411\u54CD\u5E94");
function \u521B\u5EFAJSON\u54CD\u5E94(\u6570\u636E, \u72B6\u6001\u7801 = 200, \u989D\u5916\u5934 = {}) {
  return new Response(JSON.stringify(\u6570\u636E), {
    status: \u72B6\u6001\u7801,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...\u989D\u5916\u5934
    }
  });
}
__name(\u521B\u5EFAJSON\u54CD\u5E94, "\u521B\u5EFAJSON\u54CD\u5E94");
function \u751F\u6210UUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
__name(\u751F\u6210UUID, "\u751F\u6210UUID");
async function \u52A0\u5BC6\u5BC6\u7801(\u5BC6\u7801) {
  const encoder = new TextEncoder();
  const data = encoder.encode(\u5BC6\u7801);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(\u52A0\u5BC6\u5BC6\u7801, "\u52A0\u5BC6\u5BC6\u7801");
async function \u68C0\u67E5\u9501\u5B9A(env, \u8BBE\u5907\u6807\u8BC6) {
  const \u9501\u5B9A\u65F6\u95F4\u6233 = await env.KV\u6570\u636E\u5E93.get(`lock_${\u8BBE\u5907\u6807\u8BC6}`);
  const \u5F53\u524D\u65F6\u95F4 = Date.now();
  const \u88AB\u9501\u5B9A = \u9501\u5B9A\u65F6\u95F4\u6233 && \u5F53\u524D\u65F6\u95F4 < Number(\u9501\u5B9A\u65F6\u95F4\u6233);
  return {
    \u88AB\u9501\u5B9A,
    \u5269\u4F59\u65F6\u95F4: \u88AB\u9501\u5B9A ? Math.ceil((Number(\u9501\u5B9A\u65F6\u95F4\u6233) - \u5F53\u524D\u65F6\u95F4) / 1e3) : 0
  };
}
__name(\u68C0\u67E5\u9501\u5B9A, "\u68C0\u67E5\u9501\u5B9A");
function \u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762(\u7C7B\u578B, \u989D\u5916\u53C2\u6570 = {}) {
  const \u754C\u9762\u6570\u636E = {
    \u6CE8\u518C: {
      title: "\u{1F338}\u9996\u6B21\u4F7F\u7528\u6CE8\u518C\u{1F338}",
      \u8868\u5355: `
        <form class="auth-form" action="/register/submit" method="POST" enctype="application/x-www-form-urlencoded">
          <input type="text" name="username" placeholder="\u8BBE\u7F6E\u8D26\u53F7" required pattern="^[a-zA-Z0-9]{4,20}$" title="4-20\u4F4D\u5B57\u6BCD\u6570\u5B57">
          <input type="password" name="password" placeholder="\u8BBE\u7F6E\u5BC6\u7801" required minlength="6">
          <input type="password" name="confirm" placeholder="\u786E\u8BA4\u5BC6\u7801" required>
          <button type="submit">\u7ACB\u5373\u6CE8\u518C</button>
        </form>
        ${\u989D\u5916\u53C2\u6570.\u9519\u8BEF\u4FE1\u606F ? `<div class="error-message">${\u989D\u5916\u53C2\u6570.\u9519\u8BEF\u4FE1\u606F}</div>` : ""}
      `
    },
    \u767B\u5F55: {
      title: "\u{1F338}\u6B22\u8FCE\u56DE\u6765\u{1F338}",
      \u8868\u5355: `
        <form class="auth-form" action="/login/submit" method="POST" enctype="application/x-www-form-urlencoded">
          <input type="text" name="username" placeholder="\u767B\u5F55\u8D26\u53F7" required>
          <input type="password" name="password" placeholder="\u767B\u5F55\u5BC6\u7801" required>
          <button type="submit" id="loginButton" ${\u989D\u5916\u53C2\u6570.\u9501\u5B9A\u72B6\u6001 ? "disabled" : ""}>\u7ACB\u5373\u767B\u5F55</button>
        </form>
        ${\u989D\u5916\u53C2\u6570.\u8F93\u9519\u5BC6\u7801 ? `<div class="error-message">\u5BC6\u7801\u9519\u8BEF\uFF0C\u5269\u4F59\u5C1D\u8BD5\u6B21\u6570\uFF1A${\u989D\u5916\u53C2\u6570.\u5269\u4F59\u6B21\u6570}</div>` : ""}
        ${\u989D\u5916\u53C2\u6570.\u9501\u5B9A\u72B6\u6001 ? `
          <div class="lock-message">
            \u8D26\u6237\u9501\u5B9A\uFF0C\u8BF7<span id="countdown">${\u989D\u5916\u53C2\u6570.\u5269\u4F59\u65F6\u95F4}</span>\u79D2\u540E\u91CD\u8BD5
          </div>` : ""}
        ${\u989D\u5916\u53C2\u6570.\u9519\u8BEF\u4FE1\u606F ? `<div class="error-message">${\u989D\u5916\u53C2\u6570.\u9519\u8BEF\u4FE1\u606F}</div>` : ""}
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
    
    /* \u6F02\u6D6E\u82B1\u74E3\u6548\u679C */
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
    
    /* \u53EF\u7231\u88C5\u9970\u5143\u7D20 */
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
    
    /* \u53EF\u7231\u56FE\u6807 */
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
    <div class="cute-icon">\u{1F338}</div>
    <div class="cute-icon">\u{1F33A}</div>
    <h1>${\u754C\u9762\u6570\u636E[\u7C7B\u578B].title}</h1>
    ${\u754C\u9762\u6570\u636E[\u7C7B\u578B].\u8868\u5355}
  </div>
  
  <script>
    // \u80CC\u666F\u56FE\u7247\u5207\u6362
    const lightBg = '${\u767D\u5929\u80CC\u666F\u56FE}';
    const darkBg = '${\u6697\u9ED1\u80CC\u666F\u56FE}';
    const bgImage = document.getElementById('backgroundImage');

    function updateBackground() {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // \u4F7F\u7528\u81EA\u5B9A\u4E49\u58C1\u7EB8\u6216\u9ED8\u8BA4\u58C1\u7EB8
      const customLightBg = document.getElementById('lightWallpaperInput')?.value.trim();
      const customDarkBg = document.getElementById('darkWallpaperInput')?.value.trim();
      const currentLightBg = customLightBg || lightBg;
      const currentDarkBg = customDarkBg || darkBg;
      bgImage.src = isDarkMode ? currentDarkBg : currentLightBg;
      bgImage.onerror = () => { bgImage.style.display = 'none'; };
    }
    updateBackground();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateBackground);

    // \u521B\u5EFA\u6F02\u6D6E\u82B1\u74E3\u6548\u679C
    function createPetal() {
      const petalsContainer = document.getElementById('petalsContainer');
      const petal = document.createElement('div');
      petal.className = 'petal';
      
      // \u968F\u673A\u82B1\u74E3\u989C\u8272
      const colors = ['#ffb6c1', '#ff69b4', '#ffc0cb', '#ff1493', '#ffd1dc'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // \u968F\u673A\u5927\u5C0F
      const size = Math.random() * 15 + 5;
      
      // \u968F\u673A\u4F4D\u7F6E
      const left = Math.random() * 100;
      
      // \u968F\u673A\u52A8\u753B\u65F6\u957F
      const duration = Math.random() * 10 + 10;
      
      petal.style.backgroundColor = color;
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';
      petal.style.left = left + '%';
      petal.style.animationDuration = duration + 's';
      
      petalsContainer.appendChild(petal);
      
      // \u52A8\u753B\u7ED3\u675F\u540E\u79FB\u9664\u82B1\u74E3
      setTimeout(() => {
        petal.remove();
      }, duration * 1000);
    }
    
    // \u5B9A\u671F\u521B\u5EFA\u82B1\u74E3
    setInterval(createPetal, 500);
    
    // \u521D\u59CB\u521B\u5EFA\u4E00\u4E9B\u82B1\u74E3
    for (let i = 0; i < 20; i++) {
      setTimeout(createPetal, i * 200);
    }

    // \u5012\u8BA1\u65F6\u903B\u8F91
    let remainingTime = ${\u989D\u5916\u53C2\u6570.\u9501\u5B9A\u72B6\u6001 ? \u989D\u5916\u53C2\u6570.\u5269\u4F59\u65F6\u95F4 : 0};
    const countdownElement = document.getElementById('countdown');
    const loginButton = document.getElementById('loginButton');

    function startCountdown() {
      if (!countdownElement) return;

      const interval = setInterval(() => {
        if (remainingTime <= 0) {
          clearInterval(interval);
          countdownElement.textContent = '0';
          loginButton.disabled = false;
          document.querySelector('.lock-message').textContent = '\u9501\u5B9A\u5DF2\u89E3\u9664\uFF0C\u8BF7\u91CD\u65B0\u5C1D\u8BD5\u767B\u5F55';
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
            document.querySelector('.lock-message').textContent = '\u9501\u5B9A\u5DF2\u89E3\u9664\uFF0C\u8BF7\u91CD\u65B0\u5C1D\u8BD5\u767B\u5F55';
          }
        })
        .catch(error => {
          console.error('\u540C\u6B65\u9501\u5B9A\u72B6\u6001\u5931\u8D25:', error);
        });
    }

    if (${\u989D\u5916\u53C2\u6570.\u9501\u5B9A\u72B6\u6001 ? "true" : "false"}) {
      startCountdown();
      setInterval(syncWithServer, 10000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          syncWithServer();
        }
      });
    }

    // \u9632\u6B62 UA \u5207\u6362\u89E6\u53D1\u8868\u5355\u63D0\u4EA4
    document.querySelector('.auth-form')?.addEventListener('submit', function(event) {
      if (!event.isTrusted) {
        event.preventDefault();
        console.log('\u963B\u6B62\u975E\u7528\u6237\u89E6\u53D1\u7684\u8868\u5355\u63D0\u4EA4');
      }
    });

    // \u76D1\u542C UA \u53D8\u5316\u5E76\u5E73\u6ED1\u5904\u7406
    let lastUA = navigator.userAgent;
    function checkUAChange() {
      const currentUA = navigator.userAgent;
      if (currentUA !== lastUA) {
        console.log('UA \u5DF2\u5207\u6362\uFF0C\u4ECE', lastUA, '\u5230', currentUA);
        lastUA = currentUA;
      }
    }
    setInterval(checkUAChange, 500);
    
    // \u6DFB\u52A0\u8F93\u5165\u6846\u805A\u7126\u6548\u679C
    const inputs = document.querySelectorAll('.auth-form input');
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
      });
      
      input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
      });
    });
  <\/script>
</body>
</html>
  `;
}
__name(\u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762, "\u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762");
async function \u83B7\u53D6\u6216\u521D\u59CB\u5316UUID(env) {
  let uuid = await env.KV\u6570\u636E\u5E93.get("current_uuid");
  if (!uuid) {
    uuid = \u751F\u6210UUID();
    await env.KV\u6570\u636E\u5E93.put("current_uuid", uuid);
  }
  return uuid;
}
__name(\u83B7\u53D6\u6216\u521D\u59CB\u5316UUID, "\u83B7\u53D6\u6216\u521D\u59CB\u5316UUID");
async function \u52A0\u8F7D\u8282\u70B9\u548C\u914D\u7F6E(env, hostName) {
  try {
    const \u8282\u70B9\u8DEF\u5F84\u7F13\u5B58 = await env.KV\u6570\u636E\u5E93.get("node_file_paths");
    let \u8282\u70B9\u6587\u4EF6\u8DEF\u5F84 = \u8282\u70B9\u8DEF\u5F84\u7F13\u5B58 ? JSON.parse(\u8282\u70B9\u8DEF\u5F84\u7F13\u5B58) : ["https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt", "https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt"];
    const \u624B\u52A8\u8282\u70B9\u7F13\u5B58 = await env.KV\u6570\u636E\u5E93.get("manual_preferred_ips");
    let \u624B\u52A8\u8282\u70B9\u5217\u8868 = [];
    if (\u624B\u52A8\u8282\u70B9\u7F13\u5B58) {
      \u624B\u52A8\u8282\u70B9\u5217\u8868 = JSON.parse(\u624B\u52A8\u8282\u70B9\u7F13\u5B58).map((line) => line.trim()).filter(Boolean);
    }
    const \u54CD\u5E94\u5217\u8868 = await Promise.all(
      \u8282\u70B9\u6587\u4EF6\u8DEF\u5F84.map(async (\u8DEF\u5F84) => {
        try {
          const \u54CD\u5E94 = await fetch(\u8DEF\u5F84);
          if (!\u54CD\u5E94.ok) throw new Error(`\u8BF7\u6C42 ${\u8DEF\u5F84} \u5931\u8D25\uFF0C\u72B6\u6001\u7801: ${\u54CD\u5E94.status}`);
          const \u6587\u672C = await \u54CD\u5E94.text();
          return \u6587\u672C.split("\n").map((line) => line.trim()).filter(Boolean);
        } catch (\u9519\u8BEF) {
          console.error(`\u62C9\u53D6 ${\u8DEF\u5F84} \u5931\u8D25: ${\u9519\u8BEF.message}`);
          return [];
        }
      })
    );
    const \u57DF\u540D\u8282\u70B9\u5217\u8868 = [...new Set(\u54CD\u5E94\u5217\u8868.flat())];
    const \u5408\u5E76\u8282\u70B9\u5217\u8868 = [.../* @__PURE__ */ new Set([...\u624B\u52A8\u8282\u70B9\u5217\u8868, ...\u57DF\u540D\u8282\u70B9\u5217\u8868])];
    const \u7F13\u5B58\u8282\u70B9 = await env.KV\u6570\u636E\u5E93.get("ip_preferred_ips");
    const \u5F53\u524D\u8282\u70B9\u5217\u8868 = \u7F13\u5B58\u8282\u70B9 ? JSON.parse(\u7F13\u5B58\u8282\u70B9) : [];
    const \u5217\u8868\u76F8\u540C = JSON.stringify(\u5408\u5E76\u8282\u70B9\u5217\u8868) === JSON.stringify(\u5F53\u524D\u8282\u70B9\u5217\u8868);
    if (\u5408\u5E76\u8282\u70B9\u5217\u8868.length > 0) {
      \u4F18\u9009\u8282\u70B9 = \u5408\u5E76\u8282\u70B9\u5217\u8868;
      if (!\u5217\u8868\u76F8\u540C) {
        const \u65B0\u7248\u672C = String(Date.now());
        await env.KV\u6570\u636E\u5E93.put("ip_preferred_ips", JSON.stringify(\u5408\u5E76\u8282\u70B9\u5217\u8868));
        await env.KV\u6570\u636E\u5E93.put("ip_preferred_ips_version", \u65B0\u7248\u672C);
        await env.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g="), await \u751F\u6210\u732B\u54AA(env, hostName));
        await env.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g=") + "_version", \u65B0\u7248\u672C);
        await env.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk="), await \u751F\u6210\u901A\u7528(env, hostName));
        await env.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk=") + "_version", \u65B0\u7248\u672C);
      }
    } else {
      \u4F18\u9009\u8282\u70B9 = \u5F53\u524D\u8282\u70B9\u5217\u8868.length > 0 ? \u5F53\u524D\u8282\u70B9\u5217\u8868 : [`${hostName}:443`];
    }
    await env.KV\u6570\u636E\u5E93.put("node_file_paths", JSON.stringify(\u8282\u70B9\u6587\u4EF6\u8DEF\u5F84));
  } catch (\u9519\u8BEF) {
    const \u7F13\u5B58\u8282\u70B9 = await env.KV\u6570\u636E\u5E93.get("ip_preferred_ips");
    \u4F18\u9009\u8282\u70B9 = \u7F13\u5B58\u8282\u70B9 ? JSON.parse(\u7F13\u5B58\u8282\u70B9) : [`${hostName}:443`];
    await env.KV\u6570\u636E\u5E93.put("ip_error_log", JSON.stringify({ time: Date.now(), error: "\u6240\u6709\u8DEF\u5F84\u62C9\u53D6\u5931\u8D25\u6216\u624B\u52A8\u4E0A\u4F20\u4E3A\u7A7A" }), { expirationTtl: 86400 });
  }
}
__name(\u52A0\u8F7D\u8282\u70B9\u548C\u914D\u7F6E, "\u52A0\u8F7D\u8282\u70B9\u548C\u914D\u7F6E");
async function \u83B7\u53D6\u914D\u7F6E(env, \u7C7B\u578B, hostName) {
  const \u7F13\u5B58\u952E = \u7C7B\u578B === atob("Y2xhc2g=") ? "config_" + atob("Y2xhc2g=") : "config_" + atob("djJyYXk=");
  const \u7248\u672C\u952E = `${\u7F13\u5B58\u952E}_version`;
  const \u7F13\u5B58\u914D\u7F6E = await env.KV\u6570\u636E\u5E93.get(\u7F13\u5B58\u952E);
  const \u914D\u7F6E\u7248\u672C = await env.KV\u6570\u636E\u5E93.get(\u7248\u672C\u952E) || "0";
  const \u8282\u70B9\u7248\u672C = await env.KV\u6570\u636E\u5E93.get("ip_preferred_ips_version") || "0";
  if (\u7F13\u5B58\u914D\u7F6E && \u914D\u7F6E\u7248\u672C === \u8282\u70B9\u7248\u672C) {
    return \u7F13\u5B58\u914D\u7F6E;
  }
  const \u65B0\u914D\u7F6E = \u7C7B\u578B === atob("Y2xhc2g=") ? await \u751F\u6210\u732B\u54AA(env, hostName) : await \u751F\u6210\u901A\u7528(env, hostName);
  await env.KV\u6570\u636E\u5E93.put(\u7F13\u5B58\u952E, \u65B0\u914D\u7F6E);
  await env.KV\u6570\u636E\u5E93.put(\u7248\u672C\u952E, \u8282\u70B9\u7248\u672C);
  return \u65B0\u914D\u7F6E;
}
__name(\u83B7\u53D6\u914D\u7F6E, "\u83B7\u53D6\u914D\u7F6E");
var worker_default = {
  async fetch(\u8BF7\u6C42, env) {
    try {
      if (!env.KV\u6570\u636E\u5E93) {
        return \u521B\u5EFAHTML\u54CD\u5E94(\u751F\u6210KV\u672A\u7ED1\u5B9A\u63D0\u793A\u9875\u9762());
      }
      const \u8BF7\u6C42\u5934 = \u8BF7\u6C42.headers.get("Upgrade");
      const url = new URL(\u8BF7\u6C42.url);
      const hostName = \u8BF7\u6C42.headers.get("Host");
      const UA = \u8BF7\u6C42.headers.get("User-Agent") || "unknown";
      const IP = \u8BF7\u6C42.headers.get("CF-Connecting-IP") || "unknown";
      const \u8BBE\u5907\u6807\u8BC6 = `${UA}_${IP}`;
      let formData;
      if (\u8BF7\u6C42\u5934 && \u8BF7\u6C42\u5934 === "websocket") {
        \u53CD\u4EE3\u5730\u5740 = env.PROXYIP || \u53CD\u4EE3\u5730\u5740;
        SOCKS5\u8D26\u53F7 = env.SOCKS5 || SOCKS5\u8D26\u53F7;
        return await \u5347\u7EA7\u8BF7\u6C42(\u8BF7\u6C42, env);
      }
      if (url.pathname === "/login/submit" || url.pathname === "/register/submit") {
        const contentType = \u8BF7\u6C42.headers.get("Content-Type") || "";
        if (!contentType.includes("application/x-www-form-urlencoded") && !contentType.includes("multipart/form-data")) {
          console.log(`\u65E0\u6548\u8BF7\u6C42: UA=${UA}, IP=${IP}, Path=${url.pathname}, Headers=${JSON.stringify([...\u8BF7\u6C42.headers])}`);
          return \u521B\u5EFAHTML\u54CD\u5E94(\u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762(url.pathname === "/login/submit" ? "\u767B\u5F55" : "\u6CE8\u518C", {
            \u9519\u8BEF\u4FE1\u606F: "\u8BF7\u901A\u8FC7\u6B63\u5E38\u8868\u5355\u63D0\u4EA4"
          }), 400);
        }
        try {
          formData = await \u8BF7\u6C42.formData();
        } catch (\u9519\u8BEF) {
          return \u521B\u5EFAHTML\u54CD\u5E94(\u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762(url.pathname === "/login/submit" ? "\u767B\u5F55" : "\u6CE8\u518C", {
            \u9519\u8BEF\u4FE1\u606F: "\u63D0\u4EA4\u6570\u636E\u683C\u5F0F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5"
          }), 400);
        }
      }
      if (url.pathname === "/register/submit") {
        const \u7528\u6237\u540D = formData.get("username");
        const \u5BC6\u7801 = formData.get("password");
        const \u786E\u8BA4\u5BC6\u7801 = formData.get("confirm");
        if (!\u7528\u6237\u540D || !\u5BC6\u7801 || \u5BC6\u7801 !== \u786E\u8BA4\u5BC6\u7801) {
          return \u521B\u5EFAHTML\u54CD\u5E94(\u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762("\u6CE8\u518C", {
            \u9519\u8BEF\u4FE1\u606F: \u5BC6\u7801 !== \u786E\u8BA4\u5BC6\u7801 ? "\u4E24\u6B21\u5BC6\u7801\u4E0D\u4E00\u81F4" : "\u8BF7\u586B\u5199\u5B8C\u6574\u4FE1\u606F"
          }), 400);
        }
        const \u5DF2\u6709\u7528\u6237 = await env.KV\u6570\u636E\u5E93.get("stored_credentials");
        if (\u5DF2\u6709\u7528\u6237) {
          return \u521B\u5EFA\u91CD\u5B9A\u5411\u54CD\u5E94("/login");
        }
        const \u52A0\u5BC6\u5BC6\u7801\u503C = await \u52A0\u5BC6\u5BC6\u7801(\u5BC6\u7801);
        await env.KV\u6570\u636E\u5E93.put("stored_credentials", JSON.stringify({
          \u7528\u6237\u540D,
          \u5BC6\u7801: \u52A0\u5BC6\u5BC6\u7801\u503C
        }));
        const \u65B0Token = Math.random().toString(36).substring(2);
        await env.KV\u6570\u636E\u5E93.put("current_token", \u65B0Token, { expirationTtl: 300 });
        return \u521B\u5EFA\u91CD\u5B9A\u5411\u54CD\u5E94(`/${\u914D\u7F6E\u8DEF\u5F84}`, {
          "Set-Cookie": `token=${\u65B0Token}; Path=/; HttpOnly; SameSite=Strict`
        });
      }
      if (url.pathname === "/login/submit") {
        const \u9501\u5B9A\u72B6\u6001 = await \u68C0\u67E5\u9501\u5B9A(env, \u8BBE\u5907\u6807\u8BC6);
        if (\u9501\u5B9A\u72B6\u6001.\u88AB\u9501\u5B9A) {
          return \u521B\u5EFAHTML\u54CD\u5E94(\u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762("\u767B\u5F55", {
            \u9501\u5B9A\u72B6\u6001: true,
            \u5269\u4F59\u65F6\u95F4: \u9501\u5B9A\u72B6\u6001.\u5269\u4F59\u65F6\u95F4
          }), 403);
        }
        const \u5B58\u50A8\u51ED\u636E = await env.KV\u6570\u636E\u5E93.get("stored_credentials");
        if (!\u5B58\u50A8\u51ED\u636E) {
          return \u521B\u5EFA\u91CD\u5B9A\u5411\u54CD\u5E94("/register");
        }
        const \u8F93\u5165\u7528\u6237\u540D = formData.get("username");
        const \u8F93\u5165\u5BC6\u7801 = formData.get("password");
        const \u51ED\u636E\u5BF9\u8C61 = JSON.parse(\u5B58\u50A8\u51ED\u636E || "{}");
        const \u5BC6\u7801\u5339\u914D = await \u52A0\u5BC6\u5BC6\u7801(\u8F93\u5165\u5BC6\u7801) === \u51ED\u636E\u5BF9\u8C61.\u5BC6\u7801;
        if (\u8F93\u5165\u7528\u6237\u540D === \u51ED\u636E\u5BF9\u8C61.\u7528\u6237\u540D && \u5BC6\u7801\u5339\u914D) {
          const \u65B0Token = Math.random().toString(36).substring(2);
          await env.KV\u6570\u636E\u5E93.put("current_token", \u65B0Token, { expirationTtl: 300 });
          await env.KV\u6570\u636E\u5E93.put(`fail_${\u8BBE\u5907\u6807\u8BC6}`, "0");
          return \u521B\u5EFA\u91CD\u5B9A\u5411\u54CD\u5E94(`/${\u914D\u7F6E\u8DEF\u5F84}`, {
            "Set-Cookie": `token=${\u65B0Token}; Path=/; HttpOnly; SameSite=Strict`
          });
        }
        let \u5931\u8D25\u6B21\u6570 = Number(await env.KV\u6570\u636E\u5E93.get(`fail_${\u8BBE\u5907\u6807\u8BC6}`) || 0) + 1;
        await env.KV\u6570\u636E\u5E93.put(`fail_${\u8BBE\u5907\u6807\u8BC6}`, String(\u5931\u8D25\u6B21\u6570));
        if (\u5931\u8D25\u6B21\u6570 >= \u6700\u5927\u5931\u8D25\u6B21\u6570) {
          await env.KV\u6570\u636E\u5E93.put(`lock_${\u8BBE\u5907\u6807\u8BC6}`, String(Date.now() + \u9501\u5B9A\u65F6\u95F4), { expirationTtl: 300 });
          const \u65B0\u9501\u5B9A\u72B6\u6001 = await \u68C0\u67E5\u9501\u5B9A(env, \u8BBE\u5907\u6807\u8BC6);
          return \u521B\u5EFAHTML\u54CD\u5E94(\u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762("\u767B\u5F55", {
            \u9501\u5B9A\u72B6\u6001: true,
            \u5269\u4F59\u65F6\u95F4: \u65B0\u9501\u5B9A\u72B6\u6001.\u5269\u4F59\u65F6\u95F4
          }), 403);
        }
        return \u521B\u5EFAHTML\u54CD\u5E94(\u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762("\u767B\u5F55", {
          \u8F93\u9519\u5BC6\u7801: true,
          \u5269\u4F59\u6B21\u6570: \u6700\u5927\u5931\u8D25\u6B21\u6570 - \u5931\u8D25\u6B21\u6570
        }), 401);
      }
      const \u662F\u5426\u5DF2\u6CE8\u518C = await env.KV\u6570\u636E\u5E93.get("stored_credentials");
      if (!\u662F\u5426\u5DF2\u6CE8\u518C && url.pathname !== "/register") {
        return \u521B\u5EFAHTML\u54CD\u5E94(\u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762("\u6CE8\u518C"));
      }
      switch (url.pathname) {
        case "/login":
          const \u5B58\u50A8\u51ED\u636E = await env.KV\u6570\u636E\u5E93.get("stored_credentials");
          if (!\u5B58\u50A8\u51ED\u636E) {
            return \u521B\u5EFA\u91CD\u5B9A\u5411\u54CD\u5E94("/register");
          }
          const \u9501\u5B9A\u72B6\u6001 = await \u68C0\u67E5\u9501\u5B9A(env, \u8BBE\u5907\u6807\u8BC6);
          if (\u9501\u5B9A\u72B6\u6001.\u88AB\u9501\u5B9A) {
            return \u521B\u5EFAHTML\u54CD\u5E94(\u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762("\u767B\u5F55", { \u9501\u5B9A\u72B6\u6001: true, \u5269\u4F59\u65F6\u95F4: \u9501\u5B9A\u72B6\u6001.\u5269\u4F59\u65F6\u95F4 }));
          }
          if (\u8BF7\u6C42.headers.get("Cookie")?.split("=")[1] === await env.KV\u6570\u636E\u5E93.get("current_token")) {
            return \u521B\u5EFA\u91CD\u5B9A\u5411\u54CD\u5E94(`/${\u914D\u7F6E\u8DEF\u5F84}`);
          }
          const \u5931\u8D25\u6B21\u6570 = Number(await env.KV\u6570\u636E\u5E93.get(`fail_${\u8BBE\u5907\u6807\u8BC6}`) || 0);
          return \u521B\u5EFAHTML\u54CD\u5E94(\u751F\u6210\u767B\u5F55\u6CE8\u518C\u754C\u9762("\u767B\u5F55", { \u8F93\u9519\u5BC6\u7801: \u5931\u8D25\u6B21\u6570 > 0, \u5269\u4F59\u6B21\u6570: \u6700\u5927\u5931\u8D25\u6B21\u6570 - \u5931\u8D25\u6B21\u6570 }));
        case "/reset-login-failures":
          await env.KV\u6570\u636E\u5E93.put(`fail_${\u8BBE\u5907\u6807\u8BC6}`, "0");
          await env.KV\u6570\u636E\u5E93.delete(`lock_${\u8BBE\u5907\u6807\u8BC6}`);
          return new Response(null, { status: 200 });
        case "/check-lock":
          const \u9501\u5B9A\u68C0\u67E5 = await \u68C0\u67E5\u9501\u5B9A(env, \u8BBE\u5907\u6807\u8BC6);
          return \u521B\u5EFAJSON\u54CD\u5E94({
            locked: \u9501\u5B9A\u68C0\u67E5.\u88AB\u9501\u5B9A,
            remainingTime: \u9501\u5B9A\u68C0\u67E5.\u5269\u4F59\u65F6\u95F4
          });
        case `/${\u914D\u7F6E\u8DEF\u5F84}`:
          const Token = \u8BF7\u6C42.headers.get("Cookie")?.split("=")[1];
          const \u6709\u6548Token = await env.KV\u6570\u636E\u5E93.get("current_token");
          if (!Token || Token !== \u6709\u6548Token) return \u521B\u5EFA\u91CD\u5B9A\u5411\u54CD\u5E94("/login");
          const uuid = await \u83B7\u53D6\u6216\u521D\u59CB\u5316UUID(env);
          return \u521B\u5EFAHTML\u54CD\u5E94(\u751F\u6210\u8BA2\u9605\u9875\u9762(\u914D\u7F6E\u8DEF\u5F84, hostName, uuid));
        case `/${\u914D\u7F6E\u8DEF\u5F84}/logout`:
          await env.KV\u6570\u636E\u5E93.delete("current_token");
          return \u521B\u5EFA\u91CD\u5B9A\u5411\u54CD\u5E94("/login", { "Set-Cookie": "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict" });
        case `/${\u914D\u7F6E\u8DEF\u5F84}/` + atob("Y2xhc2g="):
          await \u52A0\u8F7D\u8282\u70B9\u548C\u914D\u7F6E(env, hostName);
          const config = await \u83B7\u53D6\u914D\u7F6E(env, atob("Y2xhc2g="), hostName);
          return new Response(config, { status: 200, headers: { "Content-Type": "text/plain;charset=utf-8" } });
        case `/${\u914D\u7F6E\u8DEF\u5F84}/` + atob("djJyYXluZw=="):
          await \u52A0\u8F7D\u8282\u70B9\u548C\u914D\u7F6E(env, hostName);
          const vConfig = await \u83B7\u53D6\u914D\u7F6E(env, atob("djJyYXk="), hostName);
          return new Response(vConfig, { status: 200, headers: { "Content-Type": "text/plain;charset=utf-8" } });
        case `/${\u914D\u7F6E\u8DEF\u5F84}/upload`:
          const uploadToken = \u8BF7\u6C42.headers.get("Cookie")?.split("=")[1];
          const \u6709\u6548UploadToken = await env.KV\u6570\u636E\u5E93.get("current_token");
          if (!uploadToken || uploadToken !== \u6709\u6548UploadToken) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55" }, 401);
          }
          formData = await \u8BF7\u6C42.formData();
          const ipFiles = formData.getAll("ipFiles");
          if (!ipFiles || ipFiles.length === 0) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u672A\u9009\u62E9\u4EFB\u4F55\u6587\u4EF6" }, 400);
          }
          let allIpList = [];
          try {
            for (const ipFile of ipFiles) {
              if (!ipFile || !ipFile.text) throw new Error(`\u6587\u4EF6 ${ipFile.name} \u65E0\u6548`);
              if (!ipFile.name.toLowerCase().endsWith(".txt")) {
                throw new Error(`\u6587\u4EF6 ${ipFile.name} \u4E0D\u662Ftxt\u683C\u5F0F\uFF0C\u4EC5\u5141\u8BB8\u4E0A\u4F20txt\u683C\u5F0F\u6587\u4EF6`);
              }
              if (ipFile.size > 1024 * 1024) {
                throw new Error(`\u6587\u4EF6 ${ipFile.name} \u8D85\u8FC7\u5927\u5C0F\u9650\u5236\uFF081MB\uFF09`);
              }
              const ipText = await ipFile.text();
              const lines = ipText.split("\n").map((line) => line.trim()).filter(Boolean);
              if (lines.length === 0) {
                console.warn(`\u6587\u4EF6 ${ipFile.name} \u5185\u5BB9\u4E3A\u7A7A`);
                continue;
              }
              const validLines = [];
              for (const line of lines) {
                const nodePattern = /^(\[[0-9a-fA-F:]+\]|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*)(?::([0-9]{1,5}))?(?:#(.+?))?(?:@(tls|notls))?$/;
                const match = nodePattern.exec(line);
                if (!match) {
                  console.warn(`\u6587\u4EF6 ${ipFile.name} \u4E2D\u7684\u884C\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u5C06\u88AB\u5FFD\u7565: ${line}`);
                  continue;
                }
                const address = match[1];
                const port = match[2];
                const nodeName = match[3] || \u8282\u70B9\u540D\u79F0;
                const protocol = match[4] || "tls";
                if (port) {
                  const portNum = parseInt(port);
                  if (portNum < 1 || portNum > 65535) {
                    console.warn(`\u6587\u4EF6 ${ipFile.name} \u4E2D\u7684\u7AEF\u53E3\u65E0\u6548\uFF0C\u5C06\u88AB\u5FFD\u7565: ${line}`);
                    continue;
                  }
                }
                const ipv4Pattern = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/;
                if (ipv4Pattern.test(address)) {
                  const ipParts = address.split(".");
                  let isValidIPv4 = true;
                  for (const part of ipParts) {
                    const num = parseInt(part);
                    if (num < 0 || num > 255) {
                      isValidIPv4 = false;
                      break;
                    }
                  }
                  if (!isValidIPv4) {
                    console.warn(`\u6587\u4EF6 ${ipFile.name} \u4E2D\u7684IPv4\u5730\u5740\u65E0\u6548\uFF0C\u5C06\u88AB\u5FFD\u7565: ${line}`);
                    continue;
                  }
                }
                const standardPort = port || "443";
                const standardizedLine = `${address}:${standardPort}#${nodeName}@${protocol}`;
                validLines.push(standardizedLine);
              }
              if (validLines.length === 0) {
                throw new Error(`\u6587\u4EF6 ${ipFile.name} \u4E2D\u6CA1\u6709\u7B26\u5408\u683C\u5F0F\u8981\u6C42\u7684\u8282\u70B9`);
              }
              console.log(`\u6587\u4EF6 ${ipFile.name} \u9A8C\u8BC1\u901A\u8FC7\uFF0C\u6709\u6548\u8282\u70B9\u6570: ${validLines.length}`);
              allIpList = allIpList.concat(validLines);
            }
            if (allIpList.length === 0) {
              return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u6240\u6709\u4E0A\u4F20\u6587\u4EF6\u4E2D\u6CA1\u6709\u7B26\u5408\u683C\u5F0F\u8981\u6C42\u7684\u8282\u70B9" }, 400);
            }
            const uniqueIpList = [...new Set(allIpList)];
            const \u5F53\u524D\u624B\u52A8\u8282\u70B9 = await env.KV\u6570\u636E\u5E93.get("manual_preferred_ips");
            const \u5F53\u524D\u8282\u70B9\u5217\u8868 = \u5F53\u524D\u624B\u52A8\u8282\u70B9 ? JSON.parse(\u5F53\u524D\u624B\u52A8\u8282\u70B9) : [];
            const \u662F\u91CD\u590D\u4E0A\u4F20 = JSON.stringify(\u5F53\u524D\u8282\u70B9\u5217\u8868.sort()) === JSON.stringify(uniqueIpList.sort());
            if (\u662F\u91CD\u590D\u4E0A\u4F20) {
              return \u521B\u5EFAJSON\u54CD\u5E94({ message: "\u4E0A\u4F20\u5185\u5BB9\u4E0E\u73B0\u6709\u8282\u70B9\u76F8\u540C\uFF0C\u65E0\u9700\u66F4\u65B0" }, 200);
            }
            await env.KV\u6570\u636E\u5E93.put("manual_preferred_ips", JSON.stringify(uniqueIpList));
            const \u65B0\u7248\u672C2 = String(Date.now());
            await env.KV\u6570\u636E\u5E93.put("ip_preferred_ips_version", \u65B0\u7248\u672C2);
            await env.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g="), await \u751F\u6210\u732B\u54AA(env, hostName));
            await env.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g=") + "_version", \u65B0\u7248\u672C2);
            await env.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk="), await \u751F\u6210\u901A\u7528(env, hostName));
            await env.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk=") + "_version", \u65B0\u7248\u672C2);
            return \u521B\u5EFAJSON\u54CD\u5E94({ message: "\u4E0A\u4F20\u6210\u529F\uFF0C\u5373\u5C06\u8DF3\u8F6C" }, 200, { "Location": `/${\u914D\u7F6E\u8DEF\u5F84}` });
          } catch (\u9519\u8BEF) {
            console.error(`\u4E0A\u4F20\u5904\u7406\u5931\u8D25: ${\u9519\u8BEF.message}`);
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: `\u4E0A\u4F20\u5904\u7406\u5931\u8D25: ${\u9519\u8BEF.message}` }, 500);
          }
        case `/${\u914D\u7F6E\u8DEF\u5F84}/change-uuid`:
          const changeToken = \u8BF7\u6C42.headers.get("Cookie")?.split("=")[1];
          const \u6709\u6548ChangeToken = await env.KV\u6570\u636E\u5E93.get("current_token");
          if (!changeToken || changeToken !== \u6709\u6548ChangeToken) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          const \u65B0UUID = \u751F\u6210UUID();
          await env.KV\u6570\u636E\u5E93.put("current_uuid", \u65B0UUID);
          await env.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g="), await \u751F\u6210\u732B\u54AA(env, hostName));
          await env.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk="), await \u751F\u6210\u901A\u7528(env, hostName));
          const \u65B0\u7248\u672C = String(Date.now());
          await env.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g=") + "_version", \u65B0\u7248\u672C);
          await env.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk=") + "_version", \u65B0\u7248\u672C);
          return \u521B\u5EFAJSON\u54CD\u5E94({ uuid: \u65B0UUID }, 200);
        case `/${\u914D\u7F6E\u8DEF\u5F84}/add-node-path`:
          const addToken = \u8BF7\u6C42.headers.get("Cookie")?.split("=")[1];
          const \u6709\u6548AddToken = await env.KV\u6570\u636E\u5E93.get("current_token");
          if (!addToken || addToken !== \u6709\u6548AddToken) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          const addData = await \u8BF7\u6C42.json();
          const newPath = addData.path;
          if (!newPath || !newPath.match(/^https?:\/\//)) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u65E0\u6548\u7684URL\u683C\u5F0F" }, 400);
          }
          let currentPaths = await env.KV\u6570\u636E\u5E93.get("node_file_paths");
          currentPaths = currentPaths ? JSON.parse(currentPaths) : [];
          if (currentPaths.includes(newPath)) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u8BE5\u8DEF\u5F84\u5DF2\u5B58\u5728" }, 400);
          }
          currentPaths.push(newPath);
          await env.KV\u6570\u636E\u5E93.put("node_file_paths", JSON.stringify(currentPaths));
          await \u52A0\u8F7D\u8282\u70B9\u548C\u914D\u7F6E(env, hostName);
          return \u521B\u5EFAJSON\u54CD\u5E94({ success: true }, 200);
        case `/${\u914D\u7F6E\u8DEF\u5F84}/remove-node-path`:
          const removeToken = \u8BF7\u6C42.headers.get("Cookie")?.split("=")[1];
          const \u6709\u6548RemoveToken = await env.KV\u6570\u636E\u5E93.get("current_token");
          if (!removeToken || removeToken !== \u6709\u6548RemoveToken) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          const removeData = await \u8BF7\u6C42.json();
          const index = removeData.index;
          let paths = await env.KV\u6570\u636E\u5E93.get("node_file_paths");
          paths = paths ? JSON.parse(paths) : [];
          if (index < 0 || index >= paths.length) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u65E0\u6548\u7684\u7D22\u5F15" }, 400);
          }
          paths.splice(index, 1);
          await env.KV\u6570\u636E\u5E93.put("node_file_paths", JSON.stringify(paths));
          await \u52A0\u8F7D\u8282\u70B9\u548C\u914D\u7F6E(env, hostName);
          return \u521B\u5EFAJSON\u54CD\u5E94({ success: true }, 200);
        case `/${\u914D\u7F6E\u8DEF\u5F84}/get-node-paths`:
          const getToken = \u8BF7\u6C42.headers.get("Cookie")?.split("=")[1];
          const \u6709\u6548GetToken = await env.KV\u6570\u636E\u5E93.get("current_token");
          if (!getToken || getToken !== \u6709\u6548GetToken) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          let nodePaths = await env.KV\u6570\u636E\u5E93.get("node_file_paths");
          nodePaths = nodePaths ? JSON.parse(nodePaths) : ["https://v2.i-sweet.us.kg/ips.txt", "https://v2.i-sweet.us.kg/url.txt"];
          return \u521B\u5EFAJSON\u54CD\u5E94({ paths: nodePaths }, 200);
        case "/set-proxy-state":
          formData = await \u8BF7\u6C42.formData();
          const proxyEnabled = formData.get("proxyEnabled");
          const proxyType = formData.get("proxyType");
          const forceProxy = formData.get("forceProxy");
          await env.KV\u6570\u636E\u5E93.put("proxyEnabled", proxyEnabled);
          await env.KV\u6570\u636E\u5E93.put("proxyType", proxyType);
          await env.KV\u6570\u636E\u5E93.put("forceProxy", forceProxy);
          return new Response(null, { status: 200 });
        case "/get-proxy-status":
          const \u4EE3\u7406\u542F\u7528 = await env.KV\u6570\u636E\u5E93.get("proxyEnabled") === "true";
          const \u4EE3\u7406\u7C7B\u578B = await env.KV\u6570\u636E\u5E93.get("proxyType") || "reverse";
          const \u5F3A\u5236\u4EE3\u7406 = await env.KV\u6570\u636E\u5E93.get("forceProxy") === "true";
          const \u5F53\u524D\u53CD\u4EE3\u5730\u5740 = env.PROXYIP || \u53CD\u4EE3\u5730\u5740;
          const SOCKS5\u8D26\u53F72 = env.SOCKS5 || "";
          let status = "\u76F4\u8FDE";
          let \u8FDE\u63A5\u5730\u5740 = "";
          if (\u4EE3\u7406\u542F\u7528) {
            if (\u5F3A\u5236\u4EE3\u7406) {
              if (\u4EE3\u7406\u7C7B\u578B === "reverse" && \u5F53\u524D\u53CD\u4EE3\u5730\u5740) {
                status = "\u5F3A\u5236\u53CD\u4EE3";
                \u8FDE\u63A5\u5730\u5740 = \u5F53\u524D\u53CD\u4EE3\u5730\u5740;
              } else if (\u4EE3\u7406\u7C7B\u578B === "socks5" && SOCKS5\u8D26\u53F72) {
                status = "\u5F3A\u5236SOCKS5";
                \u8FDE\u63A5\u5730\u5740 = SOCKS5\u8D26\u53F72.split("@").pop() || SOCKS5\u8D26\u53F72;
              }
            } else if (\u4EE3\u7406\u7C7B\u578B === "reverse" && \u5F53\u524D\u53CD\u4EE3\u5730\u5740) {
              status = "\u52A8\u6001\u53CD\u4EE3";
              \u8FDE\u63A5\u5730\u5740 = \u5F53\u524D\u53CD\u4EE3\u5730\u5740;
            } else if (\u4EE3\u7406\u7C7B\u578B === "socks5" && SOCKS5\u8D26\u53F72) {
              status = "\u52A8\u6001SOCKS5";
              \u8FDE\u63A5\u5730\u5740 = SOCKS5\u8D26\u53F72.split("@").pop() || SOCKS5\u8D26\u53F72;
            }
          }
          return \u521B\u5EFAJSON\u54CD\u5E94({ status, \u8FDE\u63A5\u5730\u5740 });
        case "/set-b64-state":
          formData = await \u8BF7\u6C42.formData();
          const b64Enabled = formData.get("b64Enabled");
          await env.KV\u6570\u636E\u5E93.put("b64Enabled", b64Enabled);
          return new Response(null, { status: 200 });
        case "/get-b64-status":
          const b64\u72B6\u6001 = await env.KV\u6570\u636E\u5E93.get("b64Enabled") === "true";
          return \u521B\u5EFAJSON\u54CD\u5E94({ b64Enabled: b64\u72B6\u6001 });
        case "/set-wallpaper":
          const wallpaperToken = \u8BF7\u6C42.headers.get("Cookie")?.split("=")[1];
          const \u6709\u6548WallpaperToken = await env.KV\u6570\u636E\u5E93.get("current_token");
          if (!wallpaperToken || wallpaperToken !== \u6709\u6548WallpaperToken) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          formData = await \u8BF7\u6C42.formData();
          const lightWallpaper = formData.get("lightWallpaper") || "";
          const darkWallpaper = formData.get("darkWallpaper") || "";
          await env.KV\u6570\u636E\u5E93.put("custom_light_bg", lightWallpaper);
          await env.KV\u6570\u636E\u5E93.put("custom_dark_bg", darkWallpaper);
          return \u521B\u5EFAJSON\u54CD\u5E94({ success: true });
        case "/get-wallpaper":
          const getWallpaperToken = \u8BF7\u6C42.headers.get("Cookie")?.split("=")[1];
          const \u6709\u6548GetWallpaperToken = await env.KV\u6570\u636E\u5E93.get("current_token");
          if (!getWallpaperToken || getWallpaperToken !== \u6709\u6548GetWallpaperToken) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          const customLightBg = await env.KV\u6570\u636E\u5E93.get("custom_light_bg") || "";
          const customDarkBg = await env.KV\u6570\u636E\u5E93.get("custom_dark_bg") || "";
          return \u521B\u5EFAJSON\u54CD\u5E94({ lightWallpaper: customLightBg, darkWallpaper: customDarkBg });
        case "/reset-wallpaper":
          const resetWallpaperToken = \u8BF7\u6C42.headers.get("Cookie")?.split("=")[1];
          const \u6709\u6548ResetWallpaperToken = await env.KV\u6570\u636E\u5E93.get("current_token");
          if (!resetWallpaperToken || resetWallpaperToken !== \u6709\u6548ResetWallpaperToken) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          await env.KV\u6570\u636E\u5E93.delete("custom_light_bg");
          await env.KV\u6570\u636E\u5E93.delete("custom_dark_bg");
          return \u521B\u5EFAJSON\u54CD\u5E94({ success: true });
        case `/${\u914D\u7F6E\u8DEF\u5F84}/generate-cat-config`:
          const catToken = \u8BF7\u6C42.headers.get("Cookie")?.split("=")[1];
          const \u6709\u6548CatToken = await env.KV\u6570\u636E\u5E93.get("current_token");
          if (!catToken || catToken !== \u6709\u6548CatToken) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          try {
            await \u52A0\u8F7D\u8282\u70B9\u548C\u914D\u7F6E(env, hostName);
            const catConfig = await \u751F\u6210\u732B\u54AA(env, hostName);
            const \u65B0\u7248\u672C2 = String(Date.now());
            await env.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g="), catConfig);
            await env.KV\u6570\u636E\u5E93.put("config_" + atob("Y2xhc2g=") + "_version", \u65B0\u7248\u672C2);
            return \u521B\u5EFAJSON\u54CD\u5E94({ success: true });
          } catch (\u9519\u8BEF) {
            console.error(`\u751F\u6210\u732B\u54AA\u914D\u7F6E\u5931\u8D25: ${\u9519\u8BEF.message}`);
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: `\u751F\u6210\u732B\u54AA\u914D\u7F6E\u5931\u8D25: ${\u9519\u8BEF.message}` }, 500);
          }
        case `/${\u914D\u7F6E\u8DEF\u5F84}/generate-universal-config`:
          const universalToken = \u8BF7\u6C42.headers.get("Cookie")?.split("=")[1];
          const \u6709\u6548UniversalToken = await env.KV\u6570\u636E\u5E93.get("current_token");
          if (!universalToken || universalToken !== \u6709\u6548UniversalToken) {
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: "\u672A\u767B\u5F55\u6216Token\u65E0\u6548" }, 401);
          }
          try {
            await \u52A0\u8F7D\u8282\u70B9\u548C\u914D\u7F6E(env, hostName);
            const universalConfig = await \u751F\u6210\u901A\u7528(env, hostName);
            const \u65B0\u7248\u672C2 = String(Date.now());
            await env.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk="), universalConfig);
            await env.KV\u6570\u636E\u5E93.put("config_" + atob("djJyYXk=") + "_version", \u65B0\u7248\u672C2);
            return \u521B\u5EFAJSON\u54CD\u5E94({ success: true });
          } catch (\u9519\u8BEF) {
            console.error(`\u751F\u6210\u901A\u7528\u914D\u7F6E\u5931\u8D25: ${\u9519\u8BEF.message}`);
            return \u521B\u5EFAJSON\u54CD\u5E94({ error: `\u751F\u6210\u901A\u7528\u914D\u7F6E\u5931\u8D25: ${\u9519\u8BEF.message}` }, 500);
          }
        default:
          url.hostname = \u4F2A\u88C5\u57DF\u540D;
          url.protocol = "https:";
          return fetch(new Request(url, \u8BF7\u6C42));
      }
    } catch (error) {
      console.error(`\u5168\u5C40\u9519\u8BEF: ${error.message}`);
      return \u521B\u5EFAJSON\u54CD\u5E94({ error: `\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF: ${error.message}` }, 500);
    }
  }
};
async function \u5347\u7EA7\u8BF7\u6C42(\u8BF7\u6C42, env) {
  const \u521B\u5EFA\u63A5\u53E3 = new WebSocketPair();
  const [\u5BA2\u6237\u7AEF, \u670D\u52A1\u7AEF] = Object.values(\u521B\u5EFA\u63A5\u53E3);
  \u670D\u52A1\u7AEF.accept();
  const uuid = await \u83B7\u53D6\u6216\u521D\u59CB\u5316UUID(env);
  const \u7ED3\u679C = await \u89E3\u6790\u5934(\u89E3\u5BC6(\u8BF7\u6C42.headers.get("sec-websocket-protocol")), env, uuid);
  if (!\u7ED3\u679C) return new Response("Invalid request", { status: 400 });
  const { TCP\u63A5\u53E3, \u521D\u59CB\u6570\u636E } = \u7ED3\u679C;
  \u5EFA\u7ACB\u7BA1\u9053(\u670D\u52A1\u7AEF, TCP\u63A5\u53E3, \u521D\u59CB\u6570\u636E);
  return new Response(null, { status: 101, webSocket: \u5BA2\u6237\u7AEF });
}
__name(\u5347\u7EA7\u8BF7\u6C42, "\u5347\u7EA7\u8BF7\u6C42");
function \u89E3\u5BC6(\u6DF7\u6DC6\u5B57\u7B26) {
  \u6DF7\u6DC6\u5B57\u7B26 = \u6DF7\u6DC6\u5B57\u7B26.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(\u6DF7\u6DC6\u5B57\u7B26), (c) => c.charCodeAt(0)).buffer;
}
__name(\u89E3\u5BC6, "\u89E3\u5BC6");
async function \u89E3\u6790\u5934(\u6570\u636E, env, uuid) {
  const \u6570\u636E\u6570\u7EC4 = new Uint8Array(\u6570\u636E);
  if (\u9A8C\u8BC1\u5BC6\u94A5(\u6570\u636E\u6570\u7EC4.slice(1, 17)) !== uuid) return null;
  const \u6570\u636E\u5B9A\u4F4D = \u6570\u636E\u6570\u7EC4[17];
  const \u7AEF\u53E3 = new DataView(\u6570\u636E.slice(18 + \u6570\u636E\u5B9A\u4F4D + 1, 20 + \u6570\u636E\u5B9A\u4F4D + 1)).getUint16(0);
  const \u5730\u5740\u7D22\u5F15 = 20 + \u6570\u636E\u5B9A\u4F4D + 1;
  const \u5730\u5740\u7C7B\u578B = \u6570\u636E\u6570\u7EC4[\u5730\u5740\u7D22\u5F15];
  let \u5730\u5740 = "";
  const \u5730\u5740\u4FE1\u606F\u7D22\u5F15 = \u5730\u5740\u7D22\u5F15 + 1;
  switch (\u5730\u5740\u7C7B\u578B) {
    case 1:
      \u5730\u5740 = new Uint8Array(\u6570\u636E.slice(\u5730\u5740\u4FE1\u606F\u7D22\u5F15, \u5730\u5740\u4FE1\u606F\u7D22\u5F15 + 4)).join(".");
      break;
    case 2:
      const \u5730\u5740\u957F\u5EA6 = \u6570\u636E\u6570\u7EC4[\u5730\u5740\u4FE1\u606F\u7D22\u5F15];
      \u5730\u5740 = new TextDecoder().decode(\u6570\u636E.slice(\u5730\u5740\u4FE1\u606F\u7D22\u5F15 + 1, \u5730\u5740\u4FE1\u606F\u7D22\u5F15 + 1 + \u5730\u5740\u957F\u5EA6));
      break;
    case 3:
      \u5730\u5740 = Array.from({ length: 8 }, (_, i) => new DataView(\u6570\u636E.slice(\u5730\u5740\u4FE1\u606F\u7D22\u5F15, \u5730\u5740\u4FE1\u606F\u7D22\u5F15 + 16)).getUint16(i * 2).toString(16)).join(":");
      break;
    default:
      return null;
  }
  const \u521D\u59CB\u6570\u636E = \u6570\u636E.slice(\u5730\u5740\u4FE1\u606F\u7D22\u5F15 + (\u5730\u5740\u7C7B\u578B === 2 ? \u6570\u636E\u6570\u7EC4[\u5730\u5740\u4FE1\u606F\u7D22\u5F15] + 1 : \u5730\u5740\u7C7B\u578B === 1 ? 4 : 16));
  const TCP\u63A5\u53E3 = await \u667A\u80FD\u8FDE\u63A5(\u5730\u5740, \u7AEF\u53E3, \u5730\u5740\u7C7B\u578B, env);
  return { TCP\u63A5\u53E3, \u521D\u59CB\u6570\u636E };
}
__name(\u89E3\u6790\u5934, "\u89E3\u6790\u5934");
async function \u667A\u80FD\u8FDE\u63A5(\u5730\u5740, \u7AEF\u53E3, \u5730\u5740\u7C7B\u578B, env) {
  const \u5F53\u524D\u53CD\u4EE3\u5730\u5740 = env.PROXYIP || \u53CD\u4EE3\u5730\u5740;
  const SOCKS5\u8D26\u53F72 = env.SOCKS5 || "";
  if (!\u5730\u5740 || \u5730\u5740.trim() === "") {
    return await \u5C1D\u8BD5\u76F4\u8FDE(\u5730\u5740, \u7AEF\u53E3);
  }
  const \u662F\u57DF\u540D = \u5730\u5740\u7C7B\u578B === 2 && !\u5730\u5740.match(/^\d+\.\d+\.\d+\.\d+$/);
  const \u662FIP = \u5730\u5740\u7C7B\u578B === 1 || \u5730\u5740\u7C7B\u578B === 2 && \u5730\u5740.match(/^\d+\.\d+\.\d+\.\d+$/) || \u5730\u5740\u7C7B\u578B === 3;
  if (\u662F\u57DF\u540D || \u662FIP) {
    const \u4EE3\u7406\u542F\u7528 = await env.KV\u6570\u636E\u5E93.get("proxyEnabled") === "true";
    const \u5F3A\u5236\u4EE3\u7406 = await env.KV\u6570\u636E\u5E93.get("forceProxy") === "true";
    const \u4EE3\u7406\u7C7B\u578B = await env.KV\u6570\u636E\u5E93.get("proxyType") || "reverse";
    if (!\u4EE3\u7406\u542F\u7528) {
      return await \u5C1D\u8BD5\u76F4\u8FDE(\u5730\u5740, \u7AEF\u53E3);
    }
    if (\u5F3A\u5236\u4EE3\u7406) {
      if (\u4EE3\u7406\u7C7B\u578B === "reverse" && \u5F53\u524D\u53CD\u4EE3\u5730\u5740) {
        try {
          const [\u53CD\u4EE3\u4E3B\u673A, \u53CD\u4EE3\u7AEF\u53E3] = \u5F53\u524D\u53CD\u4EE3\u5730\u5740.split(":");
          const \u8FDE\u63A5 = connect({ hostname: \u53CD\u4EE3\u4E3B\u673A, port: \u53CD\u4EE3\u7AEF\u53E3 || \u7AEF\u53E3 });
          await \u8FDE\u63A5.opened;
          console.log(`\u5F3A\u5236\u901A\u8FC7\u53CD\u4EE3\u8FDE\u63A5: ${\u5F53\u524D\u53CD\u4EE3\u5730\u5740}`);
          return \u8FDE\u63A5;
        } catch (\u9519\u8BEF) {
          console.error(`\u5F3A\u5236\u53CD\u4EE3\u8FDE\u63A5\u5931\u8D25: ${\u9519\u8BEF.message}`);
          throw new Error(`\u5F3A\u5236\u53CD\u4EE3\u5931\u8D25: ${\u9519\u8BEF.message}`);
        }
      } else if (\u4EE3\u7406\u7C7B\u578B === "socks5" && SOCKS5\u8D26\u53F72) {
        try {
          const SOCKS5\u8FDE\u63A5 = await \u521B\u5EFASOCKS5(\u5730\u5740\u7C7B\u578B, \u5730\u5740, \u7AEF\u53E3);
          console.log(`\u5F3A\u5236\u901A\u8FC7 SOCKS5 \u8FDE\u63A5: ${\u5730\u5740}:${\u7AEF\u53E3}`);
          return SOCKS5\u8FDE\u63A5;
        } catch (\u9519\u8BEF) {
          console.error(`\u5F3A\u5236 SOCKS5 \u8FDE\u63A5\u5931\u8D25: ${\u9519\u8BEF.message}`);
          throw new Error(`\u5F3A\u5236 SOCKS5 \u5931\u8D25: ${\u9519\u8BEF.message}`);
        }
      }
    } else {
      try {
        const \u8FDE\u63A5 = await \u5C1D\u8BD5\u76F4\u8FDE(\u5730\u5740, \u7AEF\u53E3);
        return \u8FDE\u63A5;
      } catch (\u9519\u8BEF) {
        console.log(`\u76F4\u8FDE\u5931\u8D25\uFF0C\u52A8\u6001\u5207\u6362\u5230\u4EE3\u7406: ${\u9519\u8BEF.message}`);
        if (\u4EE3\u7406\u7C7B\u578B === "reverse" && \u5F53\u524D\u53CD\u4EE3\u5730\u5740) {
          try {
            const [\u53CD\u4EE3\u4E3B\u673A, \u53CD\u4EE3\u7AEF\u53E3] = \u5F53\u524D\u53CD\u4EE3\u5730\u5740.split(":");
            const \u8FDE\u63A5 = connect({ hostname: \u53CD\u4EE3\u4E3B\u673A, port: \u53CD\u4EE3\u7AEF\u53E3 || \u7AEF\u53E3 });
            await \u8FDE\u63A5.opened;
            console.log(`\u52A8\u6001\u901A\u8FC7\u53CD\u4EE3\u8FDE\u63A5: ${\u5F53\u524D\u53CD\u4EE3\u5730\u5740}`);
            return \u8FDE\u63A5;
          } catch (\u9519\u8BEF2) {
            console.error(`\u52A8\u6001\u53CD\u4EE3\u8FDE\u63A5\u5931\u8D25: ${\u9519\u8BEF2.message}`);
          }
        } else if (\u4EE3\u7406\u7C7B\u578B === "socks5" && SOCKS5\u8D26\u53F72) {
          try {
            const SOCKS5\u8FDE\u63A5 = await \u521B\u5EFASOCKS5(\u5730\u5740\u7C7B\u578B, \u5730\u5740, \u7AEF\u53E3, SOCKS5\u8D26\u53F72);
            console.log(`\u52A8\u6001\u901A\u8FC7 SOCKS5 \u8FDE\u63A5: ${\u5730\u5740}:${\u7AEF\u53E3}`);
            return SOCKS5\u8FDE\u63A5;
          } catch (\u9519\u8BEF2) {
            console.error(`\u52A8\u6001 SOCKS5 \u8FDE\u63A5\u5931\u8D25: ${\u9519\u8BEF2.message}`);
          }
        }
        throw new Error(`\u6240\u6709\u8FDE\u63A5\u5C1D\u8BD5\u5931\u8D25: ${\u9519\u8BEF.message}`);
      }
    }
  }
  return await \u5C1D\u8BD5\u76F4\u8FDE(\u5730\u5740, \u7AEF\u53E3);
}
__name(\u667A\u80FD\u8FDE\u63A5, "\u667A\u80FD\u8FDE\u63A5");
async function \u5C1D\u8BD5\u76F4\u8FDE(\u5730\u5740, \u7AEF\u53E3) {
  try {
    const \u8FDE\u63A5 = connect({ hostname: \u5730\u5740, port: \u7AEF\u53E3 });
    await \u8FDE\u63A5.opened;
    console.log(`\u56DE\u9000\u5230\u76F4\u8FDE: ${\u5730\u5740}:${\u7AEF\u53E3}`);
    return \u8FDE\u63A5;
  } catch (\u9519\u8BEF) {
    console.error(`\u76F4\u8FDE\u5931\u8D25: ${\u9519\u8BEF.message}`);
    throw new Error(`\u65E0\u6CD5\u8FDE\u63A5: ${\u9519\u8BEF.message}`);
  }
}
__name(\u5C1D\u8BD5\u76F4\u8FDE, "\u5C1D\u8BD5\u76F4\u8FDE");
function \u9A8C\u8BC1\u5BC6\u94A5(arr) {
  return Array.from(arr.slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("").match(/(.{8})(.{4})(.{4})(.{4})(.{12})/).slice(1).join("-").toLowerCase();
}
__name(\u9A8C\u8BC1\u5BC6\u94A5, "\u9A8C\u8BC1\u5BC6\u94A5");
async function \u5EFA\u7ACB\u7BA1\u9053(\u670D\u52A1\u7AEF, TCP\u63A5\u53E3, \u521D\u59CB\u6570\u636E) {
  await \u670D\u52A1\u7AEF.send(new Uint8Array([0, 0]).buffer);
  const \u6570\u636E\u6D41 = new ReadableStream({
    async start(\u63A7\u5236\u5668) {
      if (\u521D\u59CB\u6570\u636E) \u63A7\u5236\u5668.enqueue(\u521D\u59CB\u6570\u636E);
      \u670D\u52A1\u7AEF.addEventListener("message", (event) => \u63A7\u5236\u5668.enqueue(event.data));
      \u670D\u52A1\u7AEF.addEventListener("close", () => {
        \u63A7\u5236\u5668.close();
        TCP\u63A5\u53E3.close();
        setTimeout(() => \u670D\u52A1\u7AEF.close(1e3), 2);
      });
      \u670D\u52A1\u7AEF.addEventListener("error", () => {
        \u63A7\u5236\u5668.close();
        TCP\u63A5\u53E3.close();
        setTimeout(() => \u670D\u52A1\u7AEF.close(1001), 2);
      });
    }
  });
  \u6570\u636E\u6D41.pipeTo(new WritableStream({
    async write(\u6570\u636E) {
      const \u5199\u5165\u5668 = TCP\u63A5\u53E3.writable.getWriter();
      await \u5199\u5165\u5668.write(\u6570\u636E);
      \u5199\u5165\u5668.releaseLock();
    }
  }));
  TCP\u63A5\u53E3.readable.pipeTo(new WritableStream({
    async write(\u6570\u636E) {
      await \u670D\u52A1\u7AEF.send(\u6570\u636E);
    }
  }));
}
__name(\u5EFA\u7ACB\u7BA1\u9053, "\u5EFA\u7ACB\u7BA1\u9053");
async function \u521B\u5EFASOCKS5(\u5730\u5740\u7C7B\u578B, \u5730\u5740, \u7AEF\u53E3, socks5\u8D26\u53F7 = null) {
  const \u4F7F\u7528\u7684SOCKS5\u8D26\u53F7 = socks5\u8D26\u53F7 || SOCKS5\u8D26\u53F7;
  const { username, password, hostname, port } = await \u89E3\u6790SOCKS5\u8D26\u53F7(\u4F7F\u7528\u7684SOCKS5\u8D26\u53F7);
  const SOCKS5\u63A5\u53E3 = connect({ hostname, port });
  try {
    await SOCKS5\u63A5\u53E3.opened;
  } catch {
    return new Response("SOCKS5\u672A\u8FDE\u901A", { status: 400 });
  }
  const writer = SOCKS5\u63A5\u53E3.writable.getWriter();
  const reader = SOCKS5\u63A5\u53E3.readable.getReader();
  const encoder = new TextEncoder();
  await writer.write(new Uint8Array([5, 2, 0, 2]));
  let res = (await reader.read()).value;
  if (res[1] === 2) {
    if (!username || !password) return \u5173\u95ED\u63A5\u53E3();
    await writer.write(new Uint8Array([1, username.length, ...encoder.encode(username), password.length, ...encoder.encode(password)]));
    res = (await reader.read()).value;
    if (res[0] !== 1 || res[1] !== 0) return \u5173\u95ED\u63A5\u53E3();
  }
  let \u8F6C\u6362\u5730\u5740;
  switch (\u5730\u5740\u7C7B\u578B) {
    case 1:
      \u8F6C\u6362\u5730\u5740 = new Uint8Array([1, ...\u5730\u5740.split(".").map(Number)]);
      break;
    case 2:
      \u8F6C\u6362\u5730\u5740 = new Uint8Array([3, \u5730\u5740.length, ...encoder.encode(\u5730\u5740)]);
      break;
    case 3:
      \u8F6C\u6362\u5730\u5740 = new Uint8Array([4, ...\u5730\u5740.split(":").flatMap((x) => [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)])]);
      break;
    default:
      return \u5173\u95ED\u63A5\u53E3();
  }
  await writer.write(new Uint8Array([5, 1, 0, ...\u8F6C\u6362\u5730\u5740, \u7AEF\u53E3 >> 8, \u7AEF\u53E3 & 255]));
  res = (await reader.read()).value;
  if (res[0] !== 5 || res[1] !== 0) return \u5173\u95ED\u63A5\u53E3();
  writer.releaseLock();
  reader.releaseLock();
  return SOCKS5\u63A5\u53E3;
  function \u5173\u95ED\u63A5\u53E3() {
    writer.releaseLock();
    reader.releaseLock();
    SOCKS5\u63A5\u53E3.close();
    return new Response("SOCKS5\u63E1\u624B\u5931\u8D25", { status: 400 });
  }
  __name(\u5173\u95ED\u63A5\u53E3, "\u5173\u95ED\u63A5\u53E3");
}
__name(\u521B\u5EFASOCKS5, "\u521B\u5EFASOCKS5");
async function \u89E3\u6790SOCKS5\u8D26\u53F7(SOCKS5) {
  const [latter, former] = SOCKS5.split("@").reverse();
  let username, password, hostname, port;
  if (former) [username, password] = former.split(":");
  const latters = latter.split(":");
  port = Number(latters.pop());
  hostname = latters.join(":");
  return { username, password, hostname, port };
}
__name(\u89E3\u6790SOCKS5\u8D26\u53F7, "\u89E3\u6790SOCKS5\u8D26\u53F7");
function \u751F\u6210\u8BA2\u9605\u9875\u9762(\u914D\u7F6E\u8DEF\u5F842, hostName, uuid) {
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
      content: '\u{1F380}';
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
    .proxy-status, .uuid-box, .force-proxy-note { margin-top: 20px; padding: 12px 15px; border-radius: 15px; font-size: 0.9em; word-break: break-all; transition: background 0.3s ease, color 0.3s ease; width: 100%; box-sizing: border-box; line-height: 1.4; }
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
      .proxy-status, .uuid-box, .force-proxy-note { font-size: 0.85em; padding: 10px 12px; }
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
      <h1 class="card-title">\u{1F338}\u6A31\u82B1\u9762\u677F\u{1F338}</h1>
      <p style="font-size: 1em;">\u652F\u6301 <span style="color: #ff69b4;">${atob("Y2xhc2g=")}</span> \u548C <span style="color: #ff85a2;">${atob("djJyYXluZw==")}</span> \u54E6~</p>
    </div>
    <div class="card">
      <h2 class="card-title">\u{1F511} \u5F53\u524D UUID</h2>
      <div class="uuid-box">
        <span id="currentUUID">${uuid}</span>
      </div>
      <div class="button-group">
        <button class="cute-button uuid-btn" onclick="\u66F4\u6362UUID()">\u66F4\u6362 UUID</button>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">\u{1F31F} \u4EE3\u7406\u8BBE\u7F6E</h2>
      <div class="switch-container">
        <div class="toggle-row">
          <label>\u4EE3\u7406\u5F00\u5173</label>
          <label class="toggle-switch">
            <input type="checkbox" id="proxyToggle" onchange="toggleProxy()">
            <span class="slider"></span>
          </label>
        </div>
        <div class="toggle-row" id="forceProxyRow" style="display: none;">
          <label>\u5F3A\u5236\u4EE3\u7406</label>
          <label class="toggle-switch">
            <input type="checkbox" id="forceProxyToggle" onchange="toggleForceProxy()">
            <span class="slider"></span>
          </label>
        </div>
        <div class="proxy-capsule" id="proxyCapsule">
          <div class="proxy-option active" data-type="reverse" onclick="switchProxyType('reverse')">\u53CD\u4EE3</div>
          <div class="proxy-option" data-type="socks5" onclick="switchProxyType('socks5')">SOCKS5</div>
        </div>
      </div>
      <div class="proxy-status" id="proxyStatus">\u76F4\u8FDE</div>
      <div class="force-proxy-note" id="forceProxyNote" style="display: none;">
        <span id="forceProxyText"></span>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">\u{1F510} \u52A0\u5BC6\u8BBE\u7F6E</h2>
      <div class="switch-container">
        <div class="toggle-row">
          <label>Base64\u52A0\u5BC6</label>
          <label class="toggle-switch">
            <input type="checkbox" id="b64Toggle" onchange="toggleB64()">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="proxy-status" id="b64Status">\u5F53\u524D\u8BA2\u9605\u94FE\u63A5\u672A\u52A0\u5BC6</div>
    </div>
    <div class="card">
      <h2 class="card-title">\u{1F3A8} \u58C1\u7EB8\u8BBE\u7F6E</h2>
      <div class="wallpaper-settings">
        <div class="wallpaper-input-group">
          <label>\u767D\u5929\u58C1\u7EB8\u5730\u5740\uFF1A</label>
          <input type="text" id="lightWallpaperInput" class="wallpaper-input" placeholder="\u7559\u7A7A\u4F7F\u7528\u9ED8\u8BA4\u58C1\u7EB8">
        </div>
        <div class="wallpaper-input-group">
          <label>\u6697\u9ED1\u58C1\u7EB8\u5730\u5740\uFF1A</label>
          <input type="text" id="darkWallpaperInput" class="wallpaper-input" placeholder="\u7559\u7A7A\u4F7F\u7528\u9ED8\u8BA4\u58C1\u7EB8">
        </div>
        <div class="wallpaper-preview" id="wallpaperPreview">
          <div class="preview-item">
            <span>\u767D\u5929\u9884\u89C8\uFF1A</span>
            <img id="lightPreview" class="preview-img">
          </div>
          <div class="preview-item">
            <span>\u6697\u9ED1\u9884\u89C8\uFF1A</span>
            <img id="darkPreview" class="preview-img">
          </div>
        </div>
        <div class="button-group">
          <button class="cute-button" onclick="\u4FDD\u5B58\u58C1\u7EB8\u8BBE\u7F6E()">\u4FDD\u5B58\u8BBE\u7F6E</button>
          <button class="cute-button" onclick="\u6062\u590D\u9ED8\u8BA4\u58C1\u7EB8()">\u6062\u590D\u9ED8\u8BA4</button>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="upload-title">\u{1F30F} \u4F18\u9009IP\u7F51\u7EDC\u8DEF\u5F84</h2>
      <div>
        <input type="text" id="nodeUrlInput" class="url-input" placeholder="\u8F93\u5165\u8282\u70B9\u6587\u4EF6 URL\uFF08\u5982 https://example.com/ips.txt\uFF09">
        <button class="cute-button add-url-btn" onclick="\u6DFB\u52A0\u8282\u70B9\u8DEF\u5F84()">\u6DFB\u52A0\u8DEF\u5F84</button>
        <div class="url-list" id="urlList"></div>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">\u{1F43E} \u732B\u54AA\u8BA2\u9605</h2>
      <div class="link-box">
        <p>\u8BA2\u9605\u94FE\u63A5\uFF1A<br><a href="https://${hostName}/${\u914D\u7F6E\u8DEF\u5F842}/${atob("Y2xhc2g=")}">https://${hostName}/${\u914D\u7F6E\u8DEF\u5F842}/${atob("Y2xhc2g=")}</a></p>
      </div>
      <div class="button-group">
        <button class="cute-button config2-btn" onclick="\u5BFC\u5165Config('${\u914D\u7F6E\u8DEF\u5F842}', '${hostName}', '${atob("Y2xhc2g=")}')">\u4E00\u952E\u5BFC\u5165</button>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">\u{1F430} \u901A\u7528\u8BA2\u9605</h2>
      <div class="link-box">
        <p>\u8BA2\u9605\u94FE\u63A5\uFF1A<br><a href="https://${hostName}/${\u914D\u7F6E\u8DEF\u5F842}/${atob("djJyYXluZw==")}">https://${hostName}/${\u914D\u7F6E\u8DEF\u5F842}/${atob("djJyYXluZw==")}</a></p>
      </div>
      <div class="button-group">
        <button class="cute-button config2-btn" onclick="\u5BFC\u5165Config('${\u914D\u7F6E\u8DEF\u5F842}', '${hostName}', '${atob("djJyYXluZw==")}')">\u4E00\u952E\u5BFC\u5165</button>
      </div>
    </div>
    <div class="card">
      <h2 class="upload-title">\u{1F31F} \u4E0A\u4F20\u4F60\u7684\u4F18\u9009\u8282\u70B9</h2>
      <div class="upload-notice force-proxy-note">
        <p>\u8BF7\u4E0A\u4F20\u5305\u542B\u4F18\u9009IP\u6216\u57DF\u540D\u7684.txt\u6587\u4EF6\uFF0C\u6BCF\u884C\u4E00\u4E2A\u8282\u70B9</p>
      </div>
      <form id="uploadForm" action="/${\u914D\u7F6E\u8DEF\u5F842}/upload" method="POST" enctype="multipart/form-data">
        <label for="ipFiles" class="upload-label">\u9009\u62E9\u6587\u4EF6</label>
        <input type="file" id="ipFiles" name="ipFiles" accept=".txt" multiple required onchange="\u663E\u793A\u6587\u4EF6()" style="display: none;">
        <div class="file-list" id="fileList"></div>
        <button type="submit" class="cute-button upload-btn" onclick="\u5F00\u59CB\u4E0A\u4F20(event)">\u4E0A\u4F20</button>
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
        <a href="/${\u914D\u7F6E\u8DEF\u5F842}/logout" class="cute-button logout-btn">\u9000\u51FA\u767B\u5F55</a>
      </div>
    </div>
  </div>
  <script>
    const lightBg = '${\u767D\u5929\u80CC\u666F\u56FE}';
    const darkBg = '${\u6697\u9ED1\u80CC\u666F\u56FE}';
    const bgImage = document.getElementById('backgroundImage');

    async function \u83B7\u53D6\u58C1\u7EB8\u5730\u5740() {
      try {
        const response = await fetch('/get-wallpaper');
        if (response.ok) {
          const data = await response.json();
          return {
            light: data.lightWallpaper || '${\u767D\u5929\u80CC\u666F\u56FE}',
            dark: data.darkWallpaper || '${\u6697\u9ED1\u80CC\u666F\u56FE}'
          };
        }
      } catch (error) {
        console.error('\u83B7\u53D6\u58C1\u7EB8\u5730\u5740\u5931\u8D25:', error);
      }
      return {
        light: '${\u767D\u5929\u80CC\u666F\u56FE}',
        dark: '${\u6697\u9ED1\u80CC\u666F\u56FE}'
      };
    }

    async function updateBackground() {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const wallpaper = await \u83B7\u53D6\u58C1\u7EB8\u5730\u5740();
      bgImage.src = isDarkMode ? wallpaper.dark : wallpaper.light;
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

    function \u52A0\u8F7D\u8282\u70B9\u8DEF\u5F84() {
      fetch('/${\u914D\u7F6E\u8DEF\u5F842}/get-node-paths')
        .then(response => response.json())
        .then(data => {
          const urlList = document.getElementById('urlList');
          urlList.innerHTML = '';
          data.paths.forEach((path, index) => {
            const div = document.createElement('div');
            div.className = 'url-item';
            div.innerHTML = '<span>' + path + '</span><button onclick="\u79FB\u9664\u8282\u70B9\u8DEF\u5F84(' + index + ')">\u79FB\u9664</button>';
            urlList.appendChild(div);
          });
        })
        .catch(() => alert('\u52A0\u8F7D\u8282\u70B9\u8DEF\u5F84\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5~'));
    }

    function \u6DFB\u52A0\u8282\u70B9\u8DEF\u5F84() {
      const urlInput = document.getElementById('nodeUrlInput');
      const url = urlInput.value.trim();
      if (!url) {
        alert('\u5582\uFF01\u5927\u81ED\u5B9D\uFF0C\u8BF7\u8F93\u5165\u6709\u6548\u7684 URL \u54E6~');
        return;
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL \u5FC5\u987B\u4EE5 http:// \u6216 https:// \u5F00\u5934\u54E6~');
        return;
      }
      fetch('/${\u914D\u7F6E\u8DEF\u5F842}/add-node-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: url })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            urlInput.value = '';
            \u52A0\u8F7D\u8282\u70B9\u8DEF\u5F84();
            alert('\u8DEF\u5F84\u6DFB\u52A0\u6210\u529F\uFF01');
          } else {
            alert(data.error || '\u6DFB\u52A0\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5~');
          }
        })
        .catch(() => alert('\u6DFB\u52A0\u5931\u8D25\uFF0C\u7F51\u7EDC\u51FA\u9519\u5566~'));
    }

    function \u79FB\u9664\u8282\u70B9\u8DEF\u5F84(index) {
      fetch('/${\u914D\u7F6E\u8DEF\u5F842}/remove-node-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            \u52A0\u8F7D\u8282\u70B9\u8DEF\u5F84();
            alert('\u8DEF\u5F84\u79FB\u9664\u6210\u529F\uFF01');
          } else {
            alert(data.error || '\u79FB\u9664\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5~');
          }
        })
        .catch(() => alert('\u79FB\u9664\u5931\u8D25\uFF0C\u7F51\u7EDC\u51FA\u9519\u5566~'));
    }

    \u52A0\u8F7D\u8282\u70B9\u8DEF\u5F84();

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
          ? '\u5F3A\u5236\u4EE3\u7406\u5F00\u542F\u540E\uFF0C\u60A8\u7684\u51FA\u53E3\u5C06\u56FA\u5B9A\u4E3A\u4EE3\u7406\u670D\u52A1\u5668\u7684\u5F52\u5C5E\u5730\u3002'
          : '\u52A8\u6001\u4EE3\u7406\u5C06\u4F18\u5148\u5C1D\u8BD5\u76F4\u8FDE\uFF0C\u5931\u8D25\u65F6\u81EA\u52A8\u5207\u6362\u81F3\u4EE3\u7406\u3002';
      }
    }

    function updateProxyStatus() {
      const statusElement = document.getElementById('proxyStatus');
      if (!proxyEnabled) {
        statusElement.textContent = '\u76F4\u8FDE';
        statusElement.className = 'proxy-status direct';
      } else {
        fetch('/get-proxy-status')
          .then(response => response.json())
          .then(data => {
            let statusText = data.status;
            if (data.\u8FDE\u63A5\u5730\u5740) {
              statusText += '\uFF1A' + data.\u8FDE\u63A5\u5730\u5740;
            }
            statusElement.textContent = statusText;
            statusElement.className = 'proxy-status ' + (data.status === '\u76F4\u8FDE' ? 'direct' : 'success');
          })
          .catch(() => {
            statusElement.textContent = '\u76F4\u8FDE';
            statusElement.className = 'proxy-status direct';
          });
      }
    }

    function toggleB64() {
      b64Enabled = document.getElementById('b64Toggle').checked;
      localStorage.setItem('b64Enabled', b64Enabled);
      saveB64State();
      updateB64Status();
      // \u7ACB\u5373\u751F\u6210\u732B\u54AA\u548C\u901A\u7528\u914D\u7F6E\u5E76\u5B58\u5165KV\u6570\u636E\u5E93
      generateAndSaveConfigs();
    }

    function generateAndSaveConfigs() {
      // \u751F\u6210\u732B\u54AA\u914D\u7F6E
      fetch('/${\u914D\u7F6E\u8DEF\u5F842}/generate-cat-config', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('\u732B\u54AA\u914D\u7F6E\u5DF2\u751F\u6210\u5E76\u4FDD\u5B58');
          } else {
            console.error('\u732B\u54AA\u914D\u7F6E\u751F\u6210\u5931\u8D25:', data.error);
          }
        })
        .catch(error => console.error('\u732B\u54AA\u914D\u7F6E\u751F\u6210\u8BF7\u6C42\u5931\u8D25:', error));
      
      // \u751F\u6210\u901A\u7528\u914D\u7F6E
      fetch('/${\u914D\u7F6E\u8DEF\u5F842}/generate-universal-config', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('\u901A\u7528\u914D\u7F6E\u5DF2\u751F\u6210\u5E76\u4FDD\u5B58');
          } else {
            console.error('\u901A\u7528\u914D\u7F6E\u751F\u6210\u5931\u8D25:', data.error);
          }
        })
        .catch(error => console.error('\u901A\u7528\u914D\u7F6E\u751F\u6210\u8BF7\u6C42\u5931\u8D25:', error));
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
        statusElement.textContent = '\u5F53\u524D\u8BA2\u9605\u94FE\u63A5\u5DF2Base64\u52A0\u5BC6';
        statusElement.className = 'proxy-status success';
      } else {
        statusElement.textContent = '\u5F53\u524D\u8BA2\u9605\u94FE\u63A5\u672A\u52A0\u5BC6';
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

    function \u5BFC\u5165Config(\u914D\u7F6E\u8DEF\u5F84, hostName, type) {
      window.location.href = type + '://install-config?url=https://' + hostName + '/${\u914D\u7F6E\u8DEF\u5F842}/' + type;
    }

    function \u66F4\u6362UUID() {
      fetch('/${\u914D\u7F6E\u8DEF\u5F842}/change-uuid', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          if (data.uuid) {
            document.getElementById('currentUUID').textContent = data.uuid;
            alert('UUID \u5DF2\u66F4\u6362\u6210\u529F\uFF01\u8BF7\u91CD\u65B0\u83B7\u53D6\u8BA2\u9605\u94FE\u63A5~');
          } else {
            alert('\u66F4\u6362 UUID \u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5~');
          }
        })
        .catch(() => alert('\u66F4\u6362 UUID \u5931\u8D25\uFF0C\u7F51\u7EDC\u51FA\u9519\u5566~'));
    }

    function \u663E\u793A\u6587\u4EF6() {
      const fileInput = document.getElementById('ipFiles');
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '';
      Array.from(fileInput.files).forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = '<span>' + file.name + ' (' + (file.size / 1024).toFixed(2) + ' KB)</span><button onclick="\u79FB\u9664\u6587\u4EF6(' + index + ')">\u79FB\u9664</button>';
        fileList.appendChild(div);
      });
    }

    function \u79FB\u9664\u6587\u4EF6(index) {
      const fileInput = document.getElementById('ipFiles');
      const dt = new DataTransfer();
      Array.from(fileInput.files).forEach((file, i) => { if (i !== index) dt.items.add(file); });
      fileInput.files = dt.files;
      \u663E\u793A\u6587\u4EF6();
    }

    function \u5F00\u59CB\u4E0A\u4F20(event) {
      event.preventDefault();
      const form = document.getElementById('uploadForm');
      const progressContainer = document.getElementById('progressContainer');
      const progressFill = document.getElementById('progressFill');
      const progressText = document.getElementById('progressText');
      const formData = new FormData(form);

      if (!formData.getAll('ipFiles').length) {
        alert('\u5582\uFF01\u5927\u81ED\u5B9D\uFF0C\u8BF7\u5148\u9009\u62E9\u6587\u4EF6\u54E6~');
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
                window.location.href = response.Location || '/${\u914D\u7F6E\u8DEF\u5F842}';
              }, 500);
            } else {
              throw new Error('\u54CD\u5E94\u683C\u5F0F\u9519\u8BEF');
            }
          } else {
            throw new Error(response.error || '\u672A\u77E5\u9519\u8BEF');
          }
        } catch (err) {
          progressContainer.style.display = 'none';
          alert('\u4E0A\u4F20\u5931\u8D25\u5566\uFF0C\u72B6\u6001\u7801: ' + xhr.status + '\uFF0C\u539F\u56E0: ' + err.message);
        }
      };

      xhr.onerror = function() {
        progressContainer.style.display = 'none';
        alert('\u7F51\u7EDC\u574F\u6389\u4E86\uFF0C\u5582\uFF01\u5927\u81ED\u5B9D\u8BF7\u68C0\u67E5\u4E00\u4E0B\u54E6~');
      };

      xhr.send(formData);
    }

    let lastUA = navigator.userAgent;
    function checkUAChange() {
      const currentUA = navigator.userAgent;
      if (currentUA !== lastUA) {
        console.log('UA \u5DF2\u5207\u6362\uFF0C\u4ECE', lastUA, '\u5230', currentUA);
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
      \u521D\u59CB\u5316\u58C1\u7EB8\u8BBE\u7F6E();
    });

    // \u4FDD\u5B58\u58C1\u7EB8\u8BBE\u7F6E\u51FD\u6570
    async function \u4FDD\u5B58\u58C1\u7EB8\u8BBE\u7F6E() {
      const lightWallpaper = document.getElementById('lightWallpaperInput').value.trim();
      const darkWallpaper = document.getElementById('darkWallpaperInput').value.trim();
      
      try {
        const formData = new FormData();
        formData.append('lightWallpaper', lightWallpaper);
        formData.append('darkWallpaper', darkWallpaper);
        
        const response = await fetch('/set-wallpaper', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          alert('\u58C1\u7EB8\u8BBE\u7F6E\u4FDD\u5B58\u6210\u529F\uFF01');
          // \u66F4\u65B0\u9884\u89C8
          updateWallpaperPreview();
          // \u66F4\u65B0\u80CC\u666F\u56FE
          updateBackground();
        } else {
          const errorData = await response.json();
          alert('\u4FDD\u5B58\u5931\u8D25\uFF1A' + (errorData.error || '\u672A\u77E5\u9519\u8BEF'));
        }
      } catch (error) {
        alert('\u4FDD\u5B58\u5931\u8D25\uFF1A\u7F51\u7EDC\u9519\u8BEF');
        console.error('\u4FDD\u5B58\u58C1\u7EB8\u8BBE\u7F6E\u5931\u8D25:', error);
      }
    }

    // \u6062\u590D\u9ED8\u8BA4\u58C1\u7EB8\u51FD\u6570
    async function \u6062\u590D\u9ED8\u8BA4\u58C1\u7EB8() {
      if (!confirm('\u786E\u5B9A\u8981\u6062\u590D\u9ED8\u8BA4\u58C1\u7EB8\u5417\uFF1F')) {
        return;
      }
      
      try {
        const response = await fetch('/reset-wallpaper', {
          method: 'POST'
        });
        
        if (response.ok) {
          alert('\u9ED8\u8BA4\u58C1\u7EB8\u5DF2\u6062\u590D\uFF01');
          // \u6E05\u7A7A\u8F93\u5165\u6846
          document.getElementById('lightWallpaperInput').value = '';
          document.getElementById('darkWallpaperInput').value = '';
          // \u66F4\u65B0\u9884\u89C8
          updateWallpaperPreview();
          // \u66F4\u65B0\u80CC\u666F\u56FE
          updateBackground();
        } else {
          const errorData = await response.json();
          alert('\u6062\u590D\u5931\u8D25\uFF1A' + (errorData.error || '\u672A\u77E5\u9519\u8BEF'));
        }
      } catch (error) {
        alert('\u6062\u590D\u5931\u8D25\uFF1A\u7F51\u7EDC\u9519\u8BEF');
        console.error('\u6062\u590D\u9ED8\u8BA4\u58C1\u7EB8\u5931\u8D25:', error);
      }
    }

    // \u66F4\u65B0\u58C1\u7EB8\u9884\u89C8\u51FD\u6570
    function updateWallpaperPreview() {
      const lightWallpaper = document.getElementById('lightWallpaperInput').value.trim();
      const darkWallpaper = document.getElementById('darkWallpaperInput').value.trim();
      const lightPreview = document.getElementById('lightPreview');
      const darkPreview = document.getElementById('darkPreview');
      
      // \u8BBE\u7F6E\u767D\u5929\u9884\u89C8
      if (lightWallpaper) {
        lightPreview.src = lightWallpaper;
        lightPreview.style.display = 'block';
        lightPreview.onerror = function() {
          this.style.display = 'none';
          alert('\u767D\u5929\u58C1\u7EB8\u5730\u5740\u65E0\u6548\u6216\u65E0\u6CD5\u52A0\u8F7D');
        };
      } else {
        lightPreview.style.display = 'none';
      }
      
      // \u8BBE\u7F6E\u6697\u9ED1\u9884\u89C8
      if (darkWallpaper) {
        darkPreview.src = darkWallpaper;
        darkPreview.style.display = 'block';
        darkPreview.onerror = function() {
          this.style.display = 'none';
          alert('\u6697\u9ED1\u58C1\u7EB8\u5730\u5740\u65E0\u6548\u6216\u65E0\u6CD5\u52A0\u8F7D');
        };
      } else {
        darkPreview.style.display = 'none';
      }
    }

    // \u9875\u9762\u52A0\u8F7D\u65F6\u521D\u59CB\u5316\u58C1\u7EB8\u8BBE\u7F6E
    async function \u521D\u59CB\u5316\u58C1\u7EB8\u8BBE\u7F6E() {
      try {
        const response = await fetch('/get-wallpaper');
        if (response.ok) {
          const data = await response.json();
          document.getElementById('lightWallpaperInput').value = data.lightWallpaper || '';
          document.getElementById('darkWallpaperInput').value = data.darkWallpaper || '';
          updateWallpaperPreview();
        }
      } catch (error) {
        console.error('\u521D\u59CB\u5316\u58C1\u7EB8\u8BBE\u7F6E\u5931\u8D25:', error);
      }
    }

    // \u8F93\u5165\u6846\u53D8\u5316\u65F6\u5B9E\u65F6\u66F4\u65B0\u9884\u89C8
    document.getElementById('lightWallpaperInput').addEventListener('input', updateWallpaperPreview);
    document.getElementById('darkWallpaperInput').addEventListener('input', updateWallpaperPreview);
  <\/script>
</body>
</html>
  `;
}
__name(\u751F\u6210\u8BA2\u9605\u9875\u9762, "\u751F\u6210\u8BA2\u9605\u9875\u9762");
function \u751F\u6210KV\u672A\u7ED1\u5B9A\u63D0\u793A\u9875\u9762() {
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
    <h1>\u{1F494} \u54CE\u5440\uFF0CKV\u6CA1\u7ED1\u5B9A\u54E6</h1>
    <p>\u5582\uFF01\u5927\u81ED\u5B9D\uFF0C\u4F60\u7684 <span class="highlight">Cloudflare KV \u5B58\u50A8\u7A7A\u95F4</span> \u8FD8\u6CA1\u7ED1\u5B9A\u5462~<br>\u5FEB\u53BB <span class="highlight">Cloudflare Workers</span> \u8BBE\u7F6E\u91CC\u7ED1\u4E00\u4E2A KV \u547D\u540D\u7A7A\u95F4\uFF08\u53D8\u91CF\u540D\uFF1A<span class="highlight">KV\u6570\u636E\u5E93</span>\uFF09\uFF0C\u7136\u540E\u91CD\u65B0\u90E8\u7F72\u4E00\u4E0B\u5427\uFF01</p>
    <div class="instruction">\u7ED1\u5B9A\u597D\u540E <span class="highlight">\u5237\u65B0\u754C\u9762</span> \u5C31\u53EF\u4EE5\u8FDB\u5165\u6CE8\u518C\u5566~</div>
  </div>
  <script>
    const lightBg = '${\u767D\u5929\u80CC\u666F\u56FE}';
    const darkBg = '${\u6697\u9ED1\u80CC\u666F\u56FE}';
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
        console.log('UA \u5DF2\u5207\u6362\uFF0C\u4ECE', lastUA, '\u5230', currentUA);
        lastUA = currentUA;
      }
    }
    setInterval(checkUAChange, 500);
  <\/script>
</body>
</html>
  `;
}
__name(\u751F\u6210KV\u672A\u7ED1\u5B9A\u63D0\u793A\u9875\u9762, "\u751F\u6210KV\u672A\u7ED1\u5B9A\u63D0\u793A\u9875\u9762");
async function \u751F\u6210\u732B\u54AA(env, hostName) {
  const uuid = await \u83B7\u53D6\u6216\u521D\u59CB\u5316UUID(env);
  const \u8282\u70B9\u5217\u8868 = \u4F18\u9009\u8282\u70B9.length ? \u4F18\u9009\u8282\u70B9 : [`${hostName}:443`];
  const b64Enabled = await env.KV\u6570\u636E\u5E93.get("b64Enabled") === "true";
  const \u56FD\u5BB6\u5206\u7EC4 = {};
  \u8282\u70B9\u5217\u8868.forEach((\u8282\u70B9, \u7D22\u5F15) => {
    const [\u4E3B\u5185\u5BB9, tls] = \u8282\u70B9.split("@");
    const [\u5730\u5740\u7AEF\u53E3, \u8282\u70B9\u540D\u5B57 = \u8282\u70B9\u540D\u79F0] = \u4E3B\u5185\u5BB9.split("#");
    const [, \u5730\u5740, \u7AEF\u53E3 = "443"] = \u5730\u5740\u7AEF\u53E3.match(/^\[(.*?)\](?::(\d+))?$/) || \u5730\u5740\u7AEF\u53E3.match(/^(.*?)(?::(\d+))?$/);
    const \u4FEE\u6B63\u5730\u5740 = \u5730\u5740.includes(":") ? \u5730\u5740.replace(/^\[|\]$/g, "") : \u5730\u5740;
    const TLS\u5F00\u5173 = tls === "notls" ? "false" : "true";
    const \u56FD\u5BB6 = \u8282\u70B9\u540D\u5B57.split("-")[0] || "\u9ED8\u8BA4";
    const \u5730\u5740\u7C7B\u578B = \u4FEE\u6B63\u5730\u5740.includes(":") ? "IPv6" : "IPv4";
    \u56FD\u5BB6\u5206\u7EC4[\u56FD\u5BB6] = \u56FD\u5BB6\u5206\u7EC4[\u56FD\u5BB6] || { IPv4: [], IPv6: [] };
    \u56FD\u5BB6\u5206\u7EC4[\u56FD\u5BB6][\u5730\u5740\u7C7B\u578B].push({
      name: `${\u8282\u70B9\u540D\u5B57}-${\u56FD\u5BB6\u5206\u7EC4[\u56FD\u5BB6][\u5730\u5740\u7C7B\u578B].length + 1}`,
      config: `- name: "${\u8282\u70B9\u540D\u5B57}-${\u56FD\u5BB6\u5206\u7EC4[\u56FD\u5BB6][\u5730\u5740\u7C7B\u578B].length + 1}"
  type: ${atob("dmxlc3M=")}
  server: ${\u4FEE\u6B63\u5730\u5740}
  port: ${\u7AEF\u53E3}
  uuid: ${uuid}
  udp: false
  tls: ${TLS\u5F00\u5173}
  sni: ${hostName}
  network: ws
  ws-opts:
    path: "/?ed=2560"
    headers:
      Host: ${hostName}`
    });
  });
  const \u56FD\u5BB6\u5217\u8868 = Object.keys(\u56FD\u5BB6\u5206\u7EC4).sort();
  const \u8282\u70B9\u914D\u7F6E = \u56FD\u5BB6\u5217\u8868.flatMap((\u56FD\u5BB6) => [...\u56FD\u5BB6\u5206\u7EC4[\u56FD\u5BB6].IPv4, ...\u56FD\u5BB6\u5206\u7EC4[\u56FD\u5BB6].IPv6].map((n) => n.config)).join("\n");
  const \u56FD\u5BB6\u5206\u7EC4\u914D\u7F6E = \u56FD\u5BB6\u5217\u8868.map((\u56FD\u5BB6) => `
  - name: "${\u56FD\u5BB6}"
    type: url-test
    url: "http://www.gstatic.com/generate_204"
    interval: 120
    tolerance: 50
    proxies:
${[...\u56FD\u5BB6\u5206\u7EC4[\u56FD\u5BB6].IPv4, ...\u56FD\u5BB6\u5206\u7EC4[\u56FD\u5BB6].IPv6].map((n) => `      - "${n.name}"`).join("\n")}
`).join("");
  const \u914D\u7F6E\u6587\u672C = `# Generated at: ${(/* @__PURE__ */ new Date()).toISOString()}
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
${\u8282\u70B9\u914D\u7F6E}

proxy-groups:
  - name: "\u{1F680}\u8282\u70B9\u9009\u62E9"
    type: select
    proxies:
      - "\u{1F92A}\u81EA\u52A8\u9009\u62E9"
      - "\u{1F970}\u8D1F\u8F7D\u5747\u8861"
${\u56FD\u5BB6\u5217\u8868.map((\u56FD\u5BB6) => `      - "${\u56FD\u5BB6}"`).join("\n")}

  - name: "\u{1F92A}\u81EA\u52A8\u9009\u62E9"
    type: url-test
    url: "http://www.gstatic.com/generate_204"
    interval: 120
    tolerance: 50
    proxies:
${\u56FD\u5BB6\u5217\u8868.map((\u56FD\u5BB6) => `      - "${\u56FD\u5BB6}"`).join("\n")}

  - name: "\u{1F970}\u8D1F\u8F7D\u5747\u8861"
    type: load-balance
    strategy: round-robin
    proxies:
${\u56FD\u5BB6\u5217\u8868.map((\u56FD\u5BB6) => `      - "${\u56FD\u5BB6}"`).join("\n")}

${\u56FD\u5BB6\u5206\u7EC4\u914D\u7F6E}

rules:
  - GEOIP,LAN,DIRECT
  - DOMAIN-SUFFIX,cn,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,\u{1F680}\u8282\u70B9\u9009\u62E9
`;
  if (b64Enabled) {
    return btoa(unescape(encodeURIComponent(\u914D\u7F6E\u6587\u672C)));
  }
  return \u914D\u7F6E\u6587\u672C;
}
__name(\u751F\u6210\u732B\u54AA, "\u751F\u6210\u732B\u54AA");
async function \u751F\u6210\u901A\u7528(env, hostName) {
  const uuid = await \u83B7\u53D6\u6216\u521D\u59CB\u5316UUID(env);
  const \u8282\u70B9\u5217\u8868 = \u4F18\u9009\u8282\u70B9.length ? \u4F18\u9009\u8282\u70B9 : [`${hostName}:443`];
  const b64Enabled = await env.KV\u6570\u636E\u5E93.get("b64Enabled") === "true";
  const \u914D\u7F6E\u5217\u8868 = \u8282\u70B9\u5217\u8868.map((\u8282\u70B9) => {
    try {
      const [\u4E3B\u5185\u5BB9, tls = "tls"] = \u8282\u70B9.split("@");
      const [\u5730\u5740\u7AEF\u53E3, \u8282\u70B9\u540D\u5B57 = \u8282\u70B9\u540D\u79F0] = \u4E3B\u5185\u5BB9.split("#");
      const match = \u5730\u5740\u7AEF\u53E3.match(/^(?:\[([0-9a-fA-F:]+)\]|([^:]+))(?:\:(\d+))?$/);
      if (!match) return null;
      const \u5730\u5740 = match[1] || match[2];
      const \u7AEF\u53E3 = match[3] || "443";
      if (!\u5730\u5740) return null;
      const \u4FEE\u6B63\u5730\u5740 = \u5730\u5740.includes(":") ? `[${\u5730\u5740}]` : \u5730\u5740;
      const TLS\u5F00\u5173 = tls === "notls" ? "none" : "tls";
      const encodedPath = encodeURIComponent("/?ed=2560");
      return `${atob("dmxlc3M=")}://${uuid}@${\u4FEE\u6B63\u5730\u5740}:${\u7AEF\u53E3}?encryption=none&security=${TLS\u5F00\u5173}&type=ws&host=${hostName}&path=${encodedPath}&sni=${hostName}#${\u8282\u70B9\u540D\u5B57}`;
    } catch (error) {
      console.error(`\u751F\u6210\u901A\u7528\u8282\u70B9\u5931\u8D25: ${\u8282\u70B9}, \u9519\u8BEF: ${error.message}`);
      return null;
    }
  }).filter(Boolean);
  const \u914D\u7F6E\u6587\u672C = `# Generated at: ${(/* @__PURE__ */ new Date()).toISOString()}
${\u914D\u7F6E\u5217\u8868.length ? \u914D\u7F6E\u5217\u8868.join("\n") : atob("dmxlc3M=") + "://" + uuid + "@" + hostName + ":443?encryption=none&security=tls&type=ws&host=" + hostName + "&path=" + encodeURIComponent("/?ed=2560") + "&sni=" + hostName + "#\u9ED8\u8BA4\u8282\u70B9"}`;
  if (b64Enabled) {
    return btoa(unescape(encodeURIComponent(\u914D\u7F6E\u6587\u672C)));
  }
  return \u914D\u7F6E\u6587\u672C;
}
__name(\u751F\u6210\u901A\u7528, "\u751F\u6210\u901A\u7528");

// C:/Users/Administrator/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/Administrator/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-LqLESi/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// C:/Users/Administrator/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-LqLESi/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=_worker.js.map
