// ====================== 订阅面板界面 - 样式 ======================
import { 样式 as 花瓣样式 } from '../界面_主题/花瓣效果.js';

export const 样式 = `
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
.file-requirements { background: rgba(255, 240, 245, 0.9); border: 2px dashed #ffb6c1; color: #d63384; }
.file-requirements h3 { color: #ff85a2; }
.file-requirements .example { background: rgba(0, 0, 0, 0.3); }
/* 统一按钮样式 - 暗黑模式 */
      .cute-button {
        background: linear-gradient(to right, #ff85a2, #ff1493);
        color: #ffffff;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }
      .cute-button:hover { box-shadow: 0 5px 15px rgba(255, 133, 162, 0.6); }

      /* 暗黑模式下统一所有按钮颜色 */
      .config1-btn, .config2-btn, .logout-btn, .uuid-btn, .upload-btn, .add-url-btn, .upload-label {
        background: linear-gradient(to right, #ff85a2, #ff1493);
        color: #ffffff;
      }

      /* 确保按钮文字与背景有足够反差 */
      .upload-btn, .add-url-btn { background: linear-gradient(to right, #ff85a2, #ff1493); }
      .upload-label { background: linear-gradient(to right, #ff85a2, #ff1493); }

      /* 暗黑模式下统一输入框和状态框底色 */
      .url-input, .wallpaper-input, .auth-form input {
        background-color: rgba(50, 40, 45, 0.9) !important;
        border-color: #ff85a2 !important;
        color: #ffd1dc !important;
      }

      .proxy-status.success, .proxy-status.direct, .uuid-box, .force-proxy-note, .file-requirements {
        background: rgba(50, 40, 45, 0.9) !important;
        border: 2px dashed #ff85a2 !important;
        color: #ffd1dc !important;
      }

      /* 统一按钮样式 - 暗黑模式 */
      .cute-button {
        background: linear-gradient(to right, #ff85a2, #ff1493);
        color: #ffffff;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }
      .cute-button:hover { box-shadow: 0 5px 15px rgba(255, 133, 162, 0.6); }

      /* 暗黑模式下统一所有按钮颜色 */
      .config1-btn, .config2-btn, .logout-btn, .uuid-btn, .upload-btn, .add-url-btn, .upload-label {
        background: linear-gradient(to right, #ff85a2, #ff1493);
        color: #ffffff;
      }

      /* 确保按钮文字与背景有足够反差 */
      .upload-btn, .add-url-btn { background: linear-gradient(to right, #ff85a2, #ff1493); }
      .upload-label { background: linear-gradient(to right, #ff85a2, #ff1493); }
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
    .proxy-status, .uuid-box, .force-proxy-note { margin-top: 20px; padding: 12px 15px; border-radius: 15px; font-size: 0.9em; word-break: break-all; transition: background 0.3s ease, color 0.3s ease; width: 100%; box-sizing: border-box; line-height: 1.4; }
    .proxy-status.success { background: rgba(255, 240, 245, 0.9); color: #155724; }
    .proxy-status.direct { background: rgba(255, 240, 245, 0.9); color: #495057; }
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
    /* 统一按钮样式 - 白天模式 */
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
      background: linear-gradient(to right, #ff69b4, #ff1493);
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }
    .cute-button:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(255, 105, 180, 0.4); }
    .cute-button:active { transform: scale(0.95); }

    /* 按钮颜色统一 - 移除不同按钮的特殊颜色 */
    .config1-btn, .config2-btn, .logout-btn, .uuid-btn, .upload-btn, .add-url-btn {
      background: linear-gradient(to right, #ff69b4, #ff1493);
    }
    .upload-title { font-size: 1.4em; color: #ff85a2; margin-bottom: 15px; }
    .upload-label { padding: 10px 20px; background: linear-gradient(to right, #ffb6c1, #ff69b4); color: white; border-radius: 20px; cursor: pointer; display: inline-block; transition: all 0.3s ease; margin-top: 10px; }
    .upload-label:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(255, 105, 180, 0.4); }
    .file-list, .url-list { margin: 15px 0; max-height: 120px; overflow-y: auto; text-align: left; scrollbar-width: none; -ms-overflow-style: none; }
    .file-list::-webkit-scrollbar, .url-list::-webkit-scrollbar { display: none; }
    .file-item, .url-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-radius: 10px; margin: 5px 0; font-size: 0.9em; }
    .file-item button, .url-item button { background: #ff9999; border: none; border-radius: 15px; padding: 5px 10px; color: white; cursor: pointer; transition: background 0.3s ease; }
    .file-item button:hover, .url-item button:hover { background: #ff6666; }
    .progress-container { display: none; margin-top: 15px; }
    .progress-bar { width: 100%; height: 15px; background: #ffe6f0; border-radius: 10px; overflow: hidden; border: 1px solid #ffb6c1; }
    .progress-fill { height: 100%; background: linear-gradient(to right, #ff69b4, #ff1493); width: 0; transition: width 0.3s ease; }
    .progress-text { text-align: center; font-size: 0.85em; color: #ff6f91; margin-top: 5px; }
    .url-input {
      width: 100%;
      padding: 12px 15px;
      border-radius: 20px;
      border: 2px solid #ffb6c1;
      font-size: 1em;
      box-sizing: border-box;
      margin-bottom: 10px;
      transition: all 0.3s ease;
      background-color: rgba(255, 240, 245, 0.9);
    }

    .url-input:focus {
      border-color: #ff69b4;
      box-shadow: 0 0 10px rgba(255, 105, 180, 0.3);
      outline: none;
      transform: scale(1.02);
    }

    /* 壁纸设置样式 */
    .wallpaper-settings {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .wallpaper-input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .wallpaper-input-group label {
      font-size: 0.9em;
      color: #ff6f91;
      font-weight: 500;
    }

    .wallpaper-input {
      width: 100%;
      padding: 12px 15px;
      border-radius: 20px;
      border: 2px solid #ffb6c1;
      font-size: 1em;
      box-sizing: border-box;
      transition: all 0.3s ease;
      background-color: rgba(255, 240, 245, 0.9);
    }

    .wallpaper-input:focus {
      border-color: #ff69b4;
      box-shadow: 0 0 10px rgba(255, 105, 180, 0.3);
      outline: none;
      transform: scale(1.02);
    }

    .wallpaper-input::placeholder {
      color: #ffb6c1;
      font-size: 0.9em;
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
    .powered-by {
      text-align: center;
      font-size: 0.85em;
      color: #888;
      padding: 10px 0 5px;
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
    ${花瓣样式}
  `;
