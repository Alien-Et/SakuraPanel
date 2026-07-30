// ====================== KV未绑定提示界面 - 样式 ======================
import { 样式 as 花瓣样式 } from '../界面_主题/花瓣效果.js';

export const 样式 = `
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
      .highlight { color: #ff85a2; }
      .instruction { color: #ff85a2; }
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
    ${花瓣样式}
  `;
