import { 默认白天背景图, 默认暗黑背景图 } from '../常量.js';
import { 样式 } from './样式.js';
import { 生成脚本 } from './脚本.js';
import { 容器HTML as 花瓣容器HTML } from '../界面_主题/花瓣效果.js';

// ====================== 订阅面板界面 - 模板 ======================
export function 生成订阅页面(配置路径, hostName, uuid) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${样式}</style>
</head>
<body>
  <img id="backgroundImage" class="background-media">
  ${花瓣容器HTML}
  <div class="container">
    <div class="card">
      <h1 class="card-title">🌸樱花面板🌸</h1>
      <p style="font-size: 1em;">支持 <span style="color: #ff69b4;">${atob('Y2xhc2g=')}</span> 和 <span style="color: #ff85a2;">${atob('djJyYXluZw==')}</span> 哦~</p>
    </div>
    <div class="card">
      <h2 class="card-title"> 当前 UUID</h2>
      <div class="uuid-box">
        <span id="currentUUID">${uuid}</span>
      </div>
      <div class="button-group">
        <button class="cute-button uuid-btn" onclick="更换UUID()">更换 UUID</button>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">🌟 代理设置</h2>
      <div class="switch-container">
        <div class="toggle-row">
          <label>代理开关</label>
          <label class="toggle-switch">
            <input type="checkbox" id="proxyToggle" onchange="toggleProxy()">
            <span class="slider"></span>
          </label>
        </div>
        <div class="toggle-row" id="forceProxyRow" style="display: none;">
          <label>强制代理</label>
          <label class="toggle-switch">
            <input type="checkbox" id="forceProxyToggle" onchange="toggleForceProxy()">
            <span class="slider"></span>
          </label>
        </div>
        <div class="proxy-capsule" id="proxyCapsule">
          <div class="proxy-option active" data-type="reverse" onclick="switchProxyType('reverse')">反代</div>
          <div class="proxy-option" data-type="socks5" onclick="switchProxyType('socks5')">SOCKS5</div>
        </div>
      </div>
      <div class="proxy-status" id="proxyStatus">直连</div>
      <div class="force-proxy-note" id="forceProxyNote" style="display: none;">
        <span id="forceProxyText"></span>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">🔐 加密设置</h2>
      <div class="switch-container">
        <div class="toggle-row">
          <label>Base64加密</label>
          <label class="toggle-switch">
            <input type="checkbox" id="b64Toggle" onchange="toggleB64()">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="proxy-status" id="b64Status">当前订阅链接未加密</div>
    </div>
    <div class="card">
      <h2 class="card-title">🎫 订阅Token验证</h2>
      <div class="switch-container">
        <div class="toggle-row">
          <label>启用Token验证</label>
          <label class="toggle-switch">
            <input type="checkbox" id="subTokenToggle" onchange="toggleSubToken()">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="uuid-box" id="subTokenBox" style="display:none;">
        <span id="subTokenValue"></span>
      </div>
      <div class="proxy-status" id="subTokenStatus">当前未启用Token验证</div>
    </div>
    <div class="card">
      <h2 class="card-title">📊 CF请求统计</h2>
      <div class="switch-container">
        <div class="toggle-row">
          <label>启用请求统计</label>
          <label class="toggle-switch">
            <input type="checkbox" id="subInfoToggle" onchange="toggleSubInfo()">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="wallpaper-settings" style="margin-top: 12px;">
        <div class="wallpaper-input-group">
          <label>认证方式：</label>
          <select id="cfAuthMethod" class="wallpaper-input" onchange="切换CF认证方式()">
            <option value="token">API Token</option>
            <option value="email">邮箱 + Global API Key</option>
          </select>
        </div>
        <div id="cfTokenFields">
          <div class="wallpaper-input-group">
            <label>Account ID：</label>
            <input type="text" id="cfAccountIdInput" class="wallpaper-input" placeholder="Cloudflare Account ID">
          </div>
          <div class="wallpaper-input-group">
            <label>API Token：</label>
            <input type="text" id="cfApiTokenInput" class="wallpaper-input" placeholder="需要 Account Analytics: Read 权限" data-masked="" onfocus="cfFocus(this)" onblur="cfBlur(this)">
          </div>
        </div>
        <div id="cfEmailFields" style="display:none">
          <div class="wallpaper-input-group">
            <label>CF 邮箱：</label>
            <input type="text" id="cfEmailInput" class="wallpaper-input" placeholder="Cloudflare 登录邮箱" data-masked="" onfocus="cfFocus(this)" onblur="cfBlur(this)">
          </div>
          <div class="wallpaper-input-group">
            <label>Global API Key：</label>
            <input type="text" id="cfGlobalApiKeyInput" class="wallpaper-input" placeholder="Cloudflare Global API Key" data-masked="" onfocus="cfFocus(this)" onblur="cfBlur(this)">
          </div>
        </div>
        <div class="button-group">
          <button class="cute-button" onclick="保存CF凭证()">保存设置</button>
          <button class="cute-button" onclick="刷新用量()">刷新用量</button>
        </div>
      </div>
      <div class="proxy-status" id="subInfoStatus">当前未启用请求统计</div>
    </div>
    <div class="card">
      <h2 class="card-title">🛡️ ECH 设置</h2>
      <div class="switch-container">
        <div class="toggle-row">
          <label>启用 ECH（加密客户端问候）</label>
          <label class="toggle-switch">
            <input type="checkbox" id="echToggle" onchange="toggleEch()">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="wallpaper-settings" style="margin-top: 12px;">
        <div class="wallpaper-input-group">
          <label>ECH SNI：</label>
          <input type="text" id="echSNIInput" class="wallpaper-input" placeholder="留空表示不附加 SNI 参数（默认 cloudflare-ech.com）">
        </div>
        <div class="wallpaper-input-group">
          <label>ECH DNS：</label>
          <input type="text" id="echDNSInput" class="wallpaper-input" placeholder="留空使用默认 https://dns.alidns.com/dns-query">
        </div>
        <div class="button-group">
          <button class="cute-button" onclick="保存Ech设置()">保存设置</button>
          <button class="cute-button" onclick="恢复Ech默认()">恢复默认</button>
        </div>
      </div>
      <div class="proxy-status" id="echStatus">当前未启用 ECH</div>
    </div>
    <div class="card">
      <h2 class="card-title">✈️ 机场设置</h2>
      <div class="wallpaper-settings">
        <div class="wallpaper-input-group">
          <label>机场名称：</label>
          <input type="text" id="airportNameInput" class="wallpaper-input" placeholder="输入机场名称，默认为樱花订阅">
        </div>
        <div class="button-group">
          <button class="cute-button" onclick="保存机场设置()">保存设置</button>
          <button class="cute-button" onclick="恢复默认机场()">恢复默认</button>
        </div>
      </div>
      <div class="proxy-status" id="airportStatus">当前机场：樱花订阅</div>
    </div>
    <div class="card">
      <h2 class="card-title">🎨 壁纸设置</h2>
      <div class="wallpaper-settings">
        <div class="wallpaper-input-group">
          <label>白天壁纸地址：</label>
          <input type="text" id="lightWallpaperInput" class="wallpaper-input" placeholder="留空使用默认壁纸">
        </div>
        <div class="wallpaper-input-group">
          <label>暗黑壁纸地址：</label>
          <input type="text" id="darkWallpaperInput" class="wallpaper-input" placeholder="留空使用默认壁纸">
        </div>
        <div class="button-group">
          <button class="cute-button" onclick="保存壁纸设置()">保存设置</button>
          <button class="cute-button" onclick="恢复默认壁纸()">恢复默认</button>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="upload-title">🌏 优选IP网络路径</h2>
      <div>
        <input type="text" id="nodeUrlInput" class="url-input" placeholder="输入节点文件 URL（如 https://example.com/ips.txt）">
        <button class="cute-button add-url-btn" onclick="添加节点路径()">添加路径</button>
        <div class="url-list" id="urlList"></div>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">🐾 猫咪订阅</h2>
      <div class="link-box">
        <p>订阅链接：<br><a id="clashLink" href="https://${hostName}/${配置路径}/${atob('Y2xhc2g=')}">https://${hostName}/${配置路径}/${atob('Y2xhc2g=')}</a></p>
      </div>
      <div class="button-group">
        <button class="cute-button config2-btn" onclick="导入Config('${配置路径}', '${hostName}', '${atob('Y2xhc2g=')}')">一键导入</button>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">🐰 通用订阅</h2>
      <div class="link-box">
        <p>订阅链接：<br><a id="v2rayLink" href="https://${hostName}/${配置路径}/${atob('djJyYXk=')}">https://${hostName}/${配置路径}/${atob('djJyYXk=')}</a></p>
      </div>
      <div class="button-group">
        <button class="cute-button config2-btn" onclick="导入Config('${配置路径}', '${hostName}', '${atob('djJyYXluZw==')}')">导入手机</button>
        <button class="cute-button config2-btn" onclick="导入Config('${配置路径}', '${hostName}', '${atob('djJyYXlu')}')">导入电脑</button>
      </div>
    </div>
    <div class="card">
      <h2 class="card-title">📦 SB订阅</h2>
      <div class="link-box">
        <p>订阅链接：<br><a id="singboxLink" href="https://${hostName}/${配置路径}/${atob('c2luZ2JveA==')}">https://${hostName}/${配置路径}/${atob('c2luZ2JveA==')}</a></p>
      </div>
      <div class="button-group">
        <button class="cute-button config2-btn" onclick="导入Config('${配置路径}', '${hostName}', '${atob('c2luZ2JveA==')}')">一键导入</button>
      </div>
    </div>
    <div class="card">
      <h2 class="upload-title">🌟 上传你的优选节点</h2>
      <div class="upload-notice force-proxy-note">
        <p>请上传包含优选IP或域名的.txt文件，每行一个节点</p>
      </div>
      <form id="uploadForm" action="/${配置路径}/upload" method="POST" enctype="multipart/form-data">
        <label for="ipFiles" class="upload-label">选择文件</label>
        <input type="file" id="ipFiles" name="ipFiles" accept=".txt" multiple required onchange="显示文件()" style="display: none;">
        <div class="file-list" id="fileList"></div>
        <button type="submit" class="cute-button upload-btn" onclick="开始上传(event)">上传</button>
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
        <a href="/${配置路径}/logout" class="cute-button logout-btn">退出登录</a>
      </div>
      <div style="text-align: center; margin-top: 10px;">
        <a href="https://github.com/PoemMisty/CFData-WEB" target="_blank" rel="noopener noreferrer" style="color: #888; font-size: 0.9em; text-decoration: none;">🔗 优选工具：CFData-WEB</a>
      </div>
    </div>
    <div class="powered-by">由 <a href="https://github.com/Alien-Et/SakuraPanel" target="_blank" rel="noopener noreferrer">SakuraPanel</a> 项目驱动</div>
  </div>
  <script>${生成脚本({ 默认白天背景图, 默认暗黑背景图, 配置路径, hostName })}</script>
</body>
</html>
  `;
}
