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
    /* 专用主标题 - 震撼樱花标题（流动渐变 + 多层发光 + 呼吸光晕 + 飘落樱花 + 倒影） */
    .panel-header {
      text-align: center;
      padding: 38px 16px 30px;
      position: relative;
      margin-bottom: 14px;
      overflow: visible;
      will-change: opacity, transform, filter;
    }
    /* 呼吸光晕背景 */
    .title-aura {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 130%;
      height: 230%;
      background: radial-gradient(ellipse at center, rgba(255, 105, 180, 0.4) 0%, rgba(255, 20, 147, 0.18) 28%, transparent 65%);
      filter: blur(34px);
      z-index: 0;
      pointer-events: none;
      animation: 光晕呼吸 4.5s ease-in-out infinite;
    }
    @keyframes 光晕呼吸 {
      0%, 100% { opacity: 0.75; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    }
    /* 飘落樱花粒子 */
    .sakura-float {
      position: absolute;
      top: -18px;
      z-index: 3;
      pointer-events: none;
      filter: drop-shadow(0 0 5px rgba(255, 105, 180, 0.7));
      animation: 樱花飘落 6s ease-in-out infinite;
    }
    .s1 { left: 12%; font-size: 1.3em; animation-duration: 5s; animation-delay: 0s; }
    .s2 { left: 30%; font-size: 0.9em; animation-duration: 6.5s; animation-delay: 1.2s; }
    .s3 { left: 52%; font-size: 1.1em; animation-duration: 5.5s; animation-delay: 2.5s; }
    .s4 { left: 72%; font-size: 0.85em; animation-duration: 7s; animation-delay: 3.5s; }
    .s5 { left: 88%; font-size: 1.2em; animation-duration: 6s; animation-delay: 4.2s; }
    @keyframes 樱花飘落 {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
      12% { opacity: 1; }
      88% { opacity: 1; }
      100% { transform: translateY(150px) rotate(420deg); opacity: 0; }
    }
    .panel-title {
      font-family: 'ZCOOL QingKe HuangYou', 'PingFang SC', sans-serif;
      font-size: 4em;
      font-weight: 900;
      margin: 0;
      letter-spacing: 12px;
      display: inline-block;
      position: relative;
      z-index: 2;
      background: linear-gradient(120deg, #ffd1e8 0%, #ff69b4 25%, #ff1493 50%, #ff69b4 75%, #ffd1e8 100%);
      background-size: 300% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
      -webkit-box-reflect: below 2px -webkit-linear-gradient(top, transparent 45%, rgba(255, 182, 193, 0.28));
      animation: 渐变流光 4s linear infinite;
      filter: drop-shadow(0 0 10px rgba(255, 105, 180, 0.85)) drop-shadow(0 0 24px rgba(255, 20, 147, 0.55));
    }
    @keyframes 渐变流光 {
      0% { background-position: 0% 50%; }
      100% { background-position: 300% 50%; }
    }
    .panel-divider {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      margin: 12px auto 12px;
      width: 70%;
      max-width: 380px;
    }
    .panel-divider::before,
    .panel-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 105, 180, 0.7));
    }
    .panel-divider::after { background: linear-gradient(90deg, rgba(255, 105, 180, 0.7), transparent); }
    .panel-divider span {
      color: #ff85a2;
      font-size: 1.3em;
      filter: drop-shadow(0 0 6px rgba(255, 133, 162, 0.7));
    }
    .panel-subtitle {
      position: relative;
      z-index: 2;
      font-size: 1.05em;
      color: #d63384;
      margin: 0;
      text-shadow: 0 1px 5px rgba(255, 255, 255, 0.7);
    }
    .panel-subtitle::after {
      content: '▏';
      color: #ff1493;
      margin-left: 3px;
      font-weight: bold;
      animation: 光标闪烁 1s infinite step-start;
    }
    @keyframes 光标闪烁 {
      50% { opacity: 0; }
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
    /* 玻璃拟态分段控制器 - 反代/SOCKS5 切换 */
    .proxy-segment {
      position: relative;
      display: flex;
      padding: 4px;
      width: fit-content;
      margin: 0 auto;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.45);
      background: linear-gradient(135deg, rgba(255, 182, 193, 0.28), rgba(255, 105, 180, 0.15));
      backdrop-filter: blur(10px) saturate(160%);
      -webkit-backdrop-filter: blur(10px) saturate(160%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 4px 12px rgba(255, 182, 193, 0.25);
    }
    .proxy-segment-thumb {
      position: absolute;
      top: 4px;
      left: 4px;
      width: calc(50% - 4px);
      height: calc(100% - 8px);
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255, 105, 180, 0.75), rgba(255, 20, 147, 0.85));
      box-shadow: 0 2px 8px rgba(255, 105, 180, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(255, 20, 147, 0.3);
      transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 0;
    }
    .proxy-option {
      position: relative;
      z-index: 1;
      width: 80px;
      padding: 10px 0;
      text-align: center;
      cursor: pointer;
      color: #ff6f91;
      transition: color 0.3s ease;
      font-size: 1em;
      user-select: none;
    }
    .proxy-option.active { color: #fff; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3); }
    .proxy-option:not(.active):hover { color: #ff1493; }
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
    /* 玻璃拟态按钮 - 通用（白天） */
    .cute-button, .config1-btn, .config2-btn, .logout-btn, .uuid-btn, .upload-btn, .add-url-btn, .upload-label {
      padding: 12px 25px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.45);
      font-size: 1em;
      font-family: 'Comic Sans MS', 'Arial', sans-serif;
      color: white;
      cursor: pointer;
      transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
      box-sizing: border-box;
      display: inline-block;
      background: linear-gradient(135deg, rgba(255, 105, 180, 0.55), rgba(255, 20, 147, 0.65));
      backdrop-filter: blur(10px) saturate(160%);
      -webkit-backdrop-filter: blur(10px) saturate(160%);
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      box-shadow: 0 4px 12px rgba(255, 105, 180, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(255, 20, 147, 0.25);
    }
    .cute-button:hover, .config1-btn:hover, .config2-btn:hover, .logout-btn:hover, .uuid-btn:hover, .upload-btn:hover, .add-url-btn:hover, .upload-label:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 8px 20px rgba(255, 105, 180, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(255, 20, 147, 0.25);
      background: linear-gradient(135deg, rgba(255, 105, 180, 0.7), rgba(255, 20, 147, 0.78));
    }
    .cute-button:active, .config1-btn:active, .config2-btn:active, .logout-btn:active, .uuid-btn:active, .upload-btn:active, .add-url-btn:active, .upload-label:active {
      transform: translateY(0) scale(0.97);
      box-shadow: 0 2px 6px rgba(255, 105, 180, 0.3), inset 0 2px 4px rgba(255, 20, 147, 0.35);
    }
    .upload-title { font-size: 1.4em; color: #ff85a2; margin-bottom: 15px; }
    .upload-label { margin-top: 10px; }
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
    /* ===== 自定义下拉框（统一 UI 风格） ===== */
    .custom-select-wrapper { position: relative; width: 100%; }
    .custom-select-trigger {
      width: 100%;
      padding: 12px 40px 12px 15px;
      border-radius: 20px;
      border: 2px solid #ffb6c1;
      font-size: 1em;
      box-sizing: border-box;
      transition: all 0.3s ease;
      background-color: rgba(255, 240, 245, 0.9);
      cursor: pointer;
      position: relative;
      user-select: none;
      color: #333;
    }
    .custom-select-trigger:hover,
    .custom-select-trigger.open {
      border-color: #ff69b4;
      box-shadow: 0 0 10px rgba(255, 105, 180, 0.3);
    }
    .custom-select-trigger.open { transform: scale(1.02); }
    .custom-select-text {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .custom-select-arrow {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      transition: transform 0.3s ease;
      pointer-events: none;
      font-size: 0.7em;
      color: #ff69b4;
    }
    .custom-select-trigger.open .custom-select-arrow {
      transform: translateY(-50%) rotate(180deg);
    }
    .custom-select-options {
      display: none;
      position: absolute;
      top: calc(100% + 5px);
      left: 0;
      right: 0;
      background-color: rgba(255, 240, 245, 0.98);
      border: 2px solid #ff69b4;
      border-radius: 20px;
      max-height: 220px;
      overflow-y: auto;
      z-index: 100;
      padding: 5px;
      box-shadow: 0 8px 24px rgba(255, 105, 180, 0.25);
      animation: selectFadeIn 0.2s ease;
    }
    .custom-select-options.show { display: block; }
    .custom-select-option {
      padding: 10px 15px;
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #333;
    }
    .custom-select-option:hover { background-color: rgba(255, 182, 193, 0.5); }
    .custom-select-option.selected {
      background-color: rgba(255, 105, 180, 0.15);
      color: #ff1493;
      font-weight: 600;
    }
    @keyframes selectFadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-color-scheme: dark) {
      .custom-select-trigger,
      .custom-select-options {
        background-color: rgba(50, 40, 45, 0.95) !important;
        border-color: #ff85a2 !important;
        color: #ffd1dc !important;
      }
      .custom-select-option { color: #ffd1dc !important; }
      .custom-select-option:hover { background-color: rgba(255, 133, 162, 0.25) !important; }
      .custom-select-option.selected {
        background-color: rgba(255, 133, 162, 0.2) !important;
        color: #ff85a2 !important;
      }
      .custom-select-arrow { color: #ff85a2 !important; }
    }
    @media (max-width: 480px) {
      .card { padding: 15px; max-width: 90%; }
      .card-title { font-size: 1.3em; }
      .panel-title { font-size: 2.8em; letter-spacing: 8px; }
      .sakura-float { font-size: 0.85em; }
      .s1, .s2, .s3, .s4, .s5 { animation-duration: 5s; }
      .panel-divider { width: 85%; }
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
      /* 樱花主标题 - 暗黑模式（光晕加深 + 发光更强） */
      .title-aura { background: radial-gradient(ellipse at center, rgba(255, 133, 162, 0.32) 0%, rgba(255, 20, 147, 0.14) 28%, transparent 65%); }
      .panel-title { filter: drop-shadow(0 0 14px rgba(255, 133, 162, 0.9)) drop-shadow(0 0 28px rgba(255, 20, 147, 0.6)); }
      .panel-subtitle { color: #ffd1dc; text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5); }
      .panel-divider::before { background: linear-gradient(90deg, transparent, rgba(255, 133, 162, 0.5)); }
      .panel-divider::after { background: linear-gradient(90deg, rgba(255, 133, 162, 0.5), transparent); }
      /* 玻璃拟态分段控制器 - 暗黑模式 */
      .proxy-segment {
        background: linear-gradient(135deg, rgba(255, 133, 162, 0.16), rgba(255, 20, 147, 0.1));
        border: 1px solid rgba(255, 182, 193, 0.3);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 12px rgba(255, 133, 162, 0.2);
      }
      .proxy-segment-thumb {
        background: linear-gradient(135deg, rgba(255, 133, 162, 0.55), rgba(255, 20, 147, 0.65));
        box-shadow: 0 2px 8px rgba(255, 133, 162, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(255, 20, 147, 0.4);
      }
      .proxy-option { color: #ffd1dc; }
      .proxy-option.active { color: #ffffff; }
      .proxy-option:not(.active):hover { color: #ff85a2; }
      /* 玻璃拟态按钮 - 暗黑模式（半透明叠加于深色卡片上，毛玻璃质感更明显） */
      .cute-button, .config1-btn, .config2-btn, .logout-btn, .uuid-btn, .upload-btn, .add-url-btn, .upload-label {
        background: linear-gradient(135deg, rgba(255, 133, 162, 0.35), rgba(255, 20, 147, 0.5));
        border: 1px solid rgba(255, 182, 193, 0.4);
        color: #ffffff;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        box-shadow: 0 4px 12px rgba(255, 133, 162, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(255, 20, 147, 0.4);
      }
      .cute-button:hover, .config1-btn:hover, .config2-btn:hover, .logout-btn:hover, .uuid-btn:hover, .upload-btn:hover, .add-url-btn:hover, .upload-label:hover {
        background: linear-gradient(135deg, rgba(255, 133, 162, 0.5), rgba(255, 20, 147, 0.62));
        box-shadow: 0 8px 20px rgba(255, 133, 162, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(255, 20, 147, 0.4);
      }
      .cute-button:active, .config1-btn:active, .config2-btn:active, .logout-btn:active, .uuid-btn:active, .upload-btn:active, .add-url-btn:active, .upload-label:active {
        box-shadow: 0 2px 6px rgba(255, 133, 162, 0.25), inset 0 2px 4px rgba(255, 20, 147, 0.5);
      }
    }
    ${花瓣样式}
  `;
