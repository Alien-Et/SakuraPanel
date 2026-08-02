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
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&display=swap" rel="stylesheet">
  <style>${样式}</style>
</head>
<body>
  <img id="backgroundImage" class="background-media">
  ${花瓣容器HTML}
  <div class="container">
    <div class="panel-header">
	      <div class="title-aura"></div>
	      <span class="sakura-float s1">🌸</span>
	      <span class="sakura-float s2">🌸</span>
	      <span class="sakura-float s3">🌸</span>
	      <span class="sakura-float s4">🌸</span>
	      <span class="sakura-float s5">🌸</span>
	      <h1 class="panel-title">樱花面板</h1>
	      <div class="panel-divider"><span>❀</span></div>
	      <p class="panel-subtitle">落樱缤纷，静待君来</p>
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
        <div class="proxy-segment" id="proxyCapsule">
          <div class="proxy-segment-thumb" id="proxySegmentThumb"></div>
          <div class="proxy-option active" data-type="reverse" onclick="switchProxyType('reverse')">反代</div>
          <div class="proxy-option" data-type="socks5" onclick="switchProxyType('socks5')">SOCKS5</div>
        </div>
      </div>
      <div class="wallpaper-settings" id="proxyFieldGroup" style="margin-top: 12px; display: none;">
        <div class="wallpaper-input-group" id="reverseField">
          <label>动态反代地址：</label>
          <input type="text" id="proxyIPInput" class="wallpaper-input" placeholder="留空默认 ProxyIP.JP.CMLiussss.net">
        </div>
        <div class="wallpaper-input-group" id="socks5Field" style="display:none">
          <label>SOCKS5 账号：</label>
          <input type="text" id="socks5Input" class="wallpaper-input" placeholder="留空默认直连，格式 user:pass@host:port">
        </div>
        <div class="button-group">
          <button class="cute-button" onclick="保存代理地址()">保存地址</button>
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
      <div class="wallpaper-settings" style="margin-top: 12px;">
        <div style="font-size: 12px; color: #888; margin-bottom: 10px;">填入 Cloudflare 凭证后自动开启请求统计，未填写则不开启。每次加载面板自动刷新用量。</div>
        <div class="wallpaper-input-group">
          <label>认证方式：</label>
          <div class="custom-select-wrapper">
            <input type="hidden" id="cfAuthMethod" value="token">
            <div class="custom-select-trigger" onclick="切换下拉框(this)">
              <span class="custom-select-text">API Token</span>
              <span class="custom-select-arrow">▼</span>
            </div>
            <div class="custom-select-options">
              <div class="custom-select-option selected" data-value="token" onclick="选择下拉项(this, '切换CF认证方式')">API Token</div>
              <div class="custom-select-option" data-value="email" onclick="选择下拉项(this, '切换CF认证方式')">邮箱 + Global API Key</div>
            </div>
          </div>
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
        </div>
      </div>
      <div class="proxy-status" id="subInfoStatus">加载中...</div>
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
          <div class="custom-select-wrapper">
            <input type="hidden" id="echDNSSelect" value="https://dns.alidns.com/dns-query">
            <div class="custom-select-trigger" onclick="切换下拉框(this)">
              <span class="custom-select-text">阿里 DNS</span>
              <span class="custom-select-arrow">▼</span>
            </div>
            <div class="custom-select-options">
              <div class="custom-select-option selected" data-value="https://dns.alidns.com/dns-query" onclick="选择下拉项(this, '切换EchDNS')">阿里 DNS</div>
              <div class="custom-select-option" data-value="https://sm2.doh.pub/dns-query" onclick="选择下拉项(this, '切换EchDNS')">腾讯 DNS</div>
              <div class="custom-select-option" data-value="https://cloudflare-dns.com/dns-query" onclick="选择下拉项(this, '切换EchDNS')">Cloudflare</div>
              <div class="custom-select-option" data-value="https://dns.google/dns-query" onclick="选择下拉项(this, '切换EchDNS')">Google</div>
              <div class="custom-select-option" data-value="custom" onclick="选择下拉项(this, '切换EchDNS')">自定义...</div>
            </div>
          </div>
          <input type="text" id="echDNSInput" class="wallpaper-input" placeholder="输入自定义 DoH 地址（如 https://xxx/dns-query）" style="display:none; margin-top:8px;">
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
        <p>订阅链接：<br><a id="v2rayLink" href="https://${hostName}/${配置路径}/${atob('djJyYXluZw==')}">https://${hostName}/${配置路径}/${atob('djJyYXluZw==')}</a></p>
      </div>
      <div class="button-group">
        <button class="cute-button config2-btn" onclick="导入Config('${配置路径}', '${hostName}', '${atob('djJyYXluZw==')}')">导入手机</button>
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
      <div style="font-size: 12px; color: #888; margin-bottom: 10px;">请上传包含优选IP或域名的.txt文件，每行一个节点</div>
      <form id="uploadForm" action="/${配置路径}/upload" method="POST" enctype="multipart/form-data">
        <label for="ipFiles" class="upload-label">选择文件</label>
        <input type="file" id="ipFiles" name="ipFiles" accept=".txt" multiple required onchange="显示文件()" style="display: none;">
        <div class="file-list" id="fileList"></div>
        <div class="progress-container" id="progressContainer">
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div class="progress-text" id="progressText">0%</div>
        </div>
      </form>
      <div style="margin-top: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong>已上传节点（<span id="manualNodeCount">0</span> 个）</strong>
          <button class="cute-button" style="font-size: 0.8em; padding: 4px 10px;" onclick="清空手动节点()">全部删除</button>
        </div>
        <div class="file-list" id="manualNodeList" style="max-height: 200px; overflow-y: auto;"></div>
      </div>
    </div>
    <div class="card">
      <div class="button-group">
        <a href="/${配置路径}/logout" class="cute-button logout-btn">退出登录</a>
        <button class="cute-button reset-btn" onclick="显示重置确认()">重置</button>
      </div>
      <div style="text-align: center; margin-top: 10px;">
        <a href="https://github.com/PoemMisty/CFData-WEB" target="_blank" rel="noopener noreferrer" style="color: #888; font-size: 0.9em; text-decoration: none;">🔗 优选工具：CFData-WEB</a>
      </div>
    </div>

    <!-- 重置确认弹窗 -->
    <div id="resetModal" class="modal" style="display: none;">
      <div class="modal-content">
        <h3>⚠️ 确认重置</h3>
        <p style="color: #888; margin-bottom: 15px;">此操作将清空所有数据，包括账号、节点、代理设置、壁纸等，且需要重新注册。请输入账号密码确认：</p>
        <div class="auth-form">
          <input type="text" id="resetUsername" placeholder="请输入账号" autocomplete="username">
          <input type="password" id="resetPassword" placeholder="请输入密码" autocomplete="current-password">
        </div>
        <p id="resetError" style="color: #ff4444; font-size: 0.9em; margin-top: 10px; display: none;"></p>
        <div class="button-group" style="margin-top: 20px;">
          <button class="cute-button" onclick="执行重置()">确认重置</button>
          <button class="cute-button logout-btn" onclick="关闭重置弹窗()">取消</button>
        </div>
      </div>
    </div>
    <div class="powered-by">由 <a href="https://github.com/Alien-Et/SakuraPanel" target="_blank" rel="noopener noreferrer">SakuraPanel</a> 项目驱动</div>
  </div>
  <script>${生成脚本({ 默认白天背景图, 默认暗黑背景图, 配置路径, hostName })}</script>
</body>
</html>
  `;
}
