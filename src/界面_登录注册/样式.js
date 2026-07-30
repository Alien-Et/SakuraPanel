// ====================== 登录/注册界面 - 样式 ======================
import { 样式 as 花瓣样式 } from '../界面_主题/花瓣效果.js';

export const 样式 = `
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
      .auth-container { background: rgba(255, 245, 247, 0.85); box-shadow: 0 8px 20px rgba(255, 182, 193, 0.2); }
    }

    @media (prefers-color-scheme: dark) {
      body { background: linear-gradient(135deg, #1e1e2f, #2a2a3b); }
      .auth-container { background: rgba(30, 30, 30, 0.9); color: #ffd1dc; box-shadow: 0 8px 20px rgba(255, 133, 162, 0.2); }
      h1 { color: #ff85a2; }
      .auth-form button {
        background: linear-gradient(to right, #ff85a2, #ff1493);
        color: #ffffff;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }
      .auth-form button:hover {
        box-shadow: 0 8px 20px rgba(255, 133, 162, 0.6);
      }
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
      backdrop-filter: blur(8px);
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
      background-color: rgba(255, 240, 245, 0.9);
    }

    .auth-form input:focus {
      border-color: #ff69b4;
      box-shadow: 0 0 10px rgba(255, 105, 180, 0.3);
      transform: scale(1.02);
      outline: none;
    }

    .auth-form button {
      padding: 15px;
      background: linear-gradient(to right, #ff69b4, #ff1493);
      color: white;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      font-size: 1.1em;
      font-weight: bold;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
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
    ${花瓣样式}
    .powered-by {
      text-align: center;
      font-size: 0.85em;
      color: #888;
      margin-top: 20px;
      padding-bottom: 10px;
    }
    .powered-by a {
      color: #ff69b4;
      text-decoration: none;
    }
    .powered-by a:hover {
      color: #ff1493;
      text-decoration: underline;
    }
    @media (prefers-color-scheme: dark) {
      .powered-by { color: #aaa; }
      .powered-by a { color: #ff85a2; }
      .powered-by a:hover { color: #ff1493; }
    }
`;
