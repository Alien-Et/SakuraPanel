// 配置生成模块

/**
 * 生成猫咪配置
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} hostName - 主机名
 * @returns {Promise<string>} 猫咪配置内容
 */
export async function generateCatConfig(env, hostName) {
  try {
    const cachedNodes = await env.KV数据库.get('ip_preferred_ips');
    const nodes = cachedNodes ? JSON.parse(cachedNodes) : [];
    const currentNodeList = nodes.length > 0 ? nodes : [`${hostName}:443`];
    const uuid = await env.KV数据库.get('current_uuid');
    const domain = hostName.replace(/^[^.]+\./, '');
    const port = '443';

    // 国家分组处理
    const countryMap = new Map();
    currentNodeList.forEach((node, index) => {
      let country = 'CN';
      let nodeName = node;
      
      // 尝试从节点信息中提取国家代码
      if (node.includes('|')) {
        const parts = node.split('|');
        nodeName = parts[0];
        if (parts.length > 1) {
          country = parts[1];
        }
      }
      
      // 过滤掉无效节点
      if (!nodeName || !nodeName.includes(':')) {
        return;
      }
      
      const nodeInfo = nodeName.split(':');
      const nodeHost = nodeInfo[0];
      const nodePort = nodeInfo.length > 1 ? nodeInfo[1] : port;
      
      const wsPath = `/ws?ed=2048`;
      const userInfo = btoa(`${uuid}-${index}`);
      const configLine = `${nodeHost}:${nodePort}#${domain}|${country}|${userInfo}|${btoa(wsPath)}`;
      
      if (!countryMap.has(country)) {
        countryMap.set(country, []);
      }
      countryMap.get(country).push(configLine);
    });

    // 生成配置字符串
    let configContent = '';
    const sortedCountries = Array.from(countryMap.keys()).sort();
    
    sortedCountries.forEach(country => {
      const countryNodes = countryMap.get(country);
      configContent += `[${country}]\n${countryNodes.join('\n')}\n\n`;
    });

    return configContent.trim();
  } catch (error) {
    console.error('生成猫咪配置失败:', error);
    return '生成配置失败，请稍后再试';
  }
}

/**
 * 生成通用配置
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} hostName - 主机名
 * @returns {Promise<string>} 通用配置内容
 */
export async function generateUniversalConfig(env, hostName) {
  try {
    const cachedNodes = await env.KV数据库.get('ip_preferred_ips');
    const nodes = cachedNodes ? JSON.parse(cachedNodes) : [];
    const currentNodeList = nodes.length > 0 ? nodes : [`${hostName}:443`];
    const uuid = await env.KV数据库.get('current_uuid');
    const domain = hostName;
    
    // 处理每个节点
    const vmessConfigs = currentNodeList.map((node, index) => {
      // 解析节点信息
      let nodeName = node;
      let remark = '';
      
      if (node.includes('|')) {
        const parts = node.split('|');
        nodeName = parts[0];
        if (parts.length > 1) {
          remark = parts[1];
        }
      }
      
      // 过滤无效节点
      if (!nodeName || !nodeName.includes(':')) {
        return null;
      }
      
      const nodeInfo = nodeName.split(':');
      const nodeHost = nodeInfo[0];
      const nodePort = parseInt(nodeInfo[1]) || 443;
      
      // 生成VMess配置对象
      const vmessConfig = {
        v: '2',
        ps: `${domain}-${remark || '节点'}-${index + 1}`,
        add: nodeHost,
        port: nodePort,
        id: uuid,
        aid: '0',
        scy: 'auto',
        net: 'ws',
        type: 'none',
        host: domain,
        path: '/ws?ed=2048',
        tls: 'tls',
        sni: domain,
        alpn: 'http/1.1',
        fp: 'chrome'
      };
      
      // 返回base64编码的配置
      return btoa(JSON.stringify(vmessConfig));
    }).filter(Boolean);

    // 格式化配置字符串
    const configContent = vmessConfigs.join('\n');
    return configContent.trim();
  } catch (error) {
    console.error('生成通用配置失败:', error);
    return '生成配置失败，请稍后再试';
  }
}

/**
 * 生成订阅页面
 * @param {string} uuid - 用户UUID
 * @param {string} lightBgImage - 浅色背景图URL
 * @param {string} darkBgImage - 深色背景图URL
 * @returns {string} 订阅页面HTML内容
 */
export function generateSubscriptionPage(uuid, lightBgImage, darkBgImage) {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🌸樱花代理 - 订阅管理</title>
      <style>
        /* 响应式CSS样式 */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
          min-height: 100vh;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          transition: background-image 0.5s ease;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          max-width: 600px;
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1, h2 {
          color: #333;
          text-align: center;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
        }
        h1 { font-size: 2.5rem; color: #ff6b6b; }
        h2 { font-size: 1.5rem; margin-top: 30px; }
        .uuid-display {
          background: rgba(255, 255, 255, 0.8);
          padding: 20px;
          border-radius: 10px;
          font-family: 'Courier New', monospace;
          word-break: break-all;
          margin: 20px 0;
          position: relative;
        }
        .copy-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff6b6b;
          color: white;
          border: none;
          padding: 5px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }
        .copy-btn:hover { background: #ff5252; }
        .config-section {
          margin: 30px 0;
        }
        .config-item {
          background: rgba(255, 255, 255, 0.8);
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 15px;
          transition: transform 0.3s;
        }
        .config-item:hover { transform: translateY(-5px); }
        .config-item h3 {
          color: #333;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        .config-item h3 i {
          margin-right: 10px;
          color: #ff6b6b;
        }
        .config-url {
          font-family: 'Courier New', monospace;
          background: rgba(0, 0, 0, 0.05);
          padding: 10px;
          border-radius: 5px;
          word-break: break-all;
          margin: 10px 0;
        }
        .action-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin-right: 10px;
          transition: background 0.3s;
        }
        .action-btn:hover { background: #45a049; }
        .danger-btn {
          background: #f44336;
        }
        .danger-btn:hover { background: #d32f2f; }
        .btn-group {
          display: flex;
          justify-content: center;
          margin-top: 30px;
        }
        .toggle-theme {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
          transition: background 0.3s;
        }
        .toggle-theme:hover { background: rgba(255, 255, 255, 0.5); }
        
        /* 移动端适配 */
        @media (max-width: 600px) {
          body { padding: 10px; }
          .container { padding: 20px; }
          h1 { font-size: 2rem; }
          h2 { font-size: 1.2rem; }
          .action-btn {
            display: block;
            width: 100%;
            margin: 10px 0;
          }
          .btn-group { flex-direction: column; }
        }
      </style>
    </head>
    <body id="subscription-page">
      <button class="toggle-theme" id="theme-toggle">🌙</button>
      
      <div class="container">
        <h1>🌸樱花代理</h1>
        <h2>订阅管理中心</h2>
        
        <div class="uuid-display">
          <span>当前UUID：${uuid}</span>
          <button class="copy-btn" onclick="copyToClipboard('${uuid}')">复制</button>
        </div>
        
        <div class="config-section">
          <h3>配置链接</h3>
          
          <div class="config-item">
            <h3>🐱 猫咪配置</h3>
            <div class="config-url" id="cat-config-url">https://${location.hostname}/config/cat?uuid=${uuid}</div>
            <div class="btn-group">
              <button class="action-btn" onclick="copyToClipboard(document.getElementById('cat-config-url').textContent)">复制链接</button>
              <a href="https://${location.hostname}/config/cat?uuid=${uuid}" target="_blank" class="action-btn">打开</a>
            </div>
          </div>
          
          <div class="config-item">
            <h3>🌐 通用配置</h3>
            <div class="config-url" id="universal-config-url">https://${location.hostname}/config/universal?uuid=${uuid}</div>
            <div class="btn-group">
              <button class="action-btn" onclick="copyToClipboard(document.getElementById('universal-config-url').textContent)">复制链接</button>
              <a href="https://${location.hostname}/config/universal?uuid=${uuid}" target="_blank" class="action-btn">打开</a>
            </div>
          </div>
        </div>
        
        <div class="btn-group">
          <button class="action-btn" onclick="location.href='/update-uuid'">更换UUID</button>
          <button class="action-btn" onclick="location.href='/proxy-settings'">代理设置</button>
          <button class="action-btn danger-btn" onclick="location.href='/logout'">退出登录</button>
        </div>
      </div>
      
      <script>
        // 切换主题
        const themeToggle = document.getElementById('theme-toggle');
        const subscriptionPage = document.getElementById('subscription-page');
        
        // 初始化主题
        function initTheme() {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
          
          if (savedTheme === 'dark') {
            subscriptionPage.style.backgroundImage = 'url(${darkBgImage})';
            themeToggle.textContent = '☀️';
          } else {
            subscriptionPage.style.backgroundImage = 'url(${lightBgImage})';
            themeToggle.textContent = '🌙';
          }
        }
        
        // 切换主题事件
        themeToggle.addEventListener('click', () => {
          const currentTheme = localStorage.getItem('theme') || 'light';
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          
          localStorage.setItem('theme', newTheme);
          
          if (newTheme === 'dark') {
            subscriptionPage.style.backgroundImage = 'url(${darkBgImage})';
            themeToggle.textContent = '☀️';
          } else {
            subscriptionPage.style.backgroundImage = 'url(${lightBgImage})';
            themeToggle.textContent = '🌙';
          }
        });
        
        // 复制到剪贴板
        function copyToClipboard(text) {
          navigator.clipboard.writeText(text)
            .then(() => {
              const btn = event.target;
              const originalText = btn.textContent;
              btn.textContent = '已复制!';
              setTimeout(() => {
                btn.textContent = originalText;
              }, 2000);
            })
            .catch(err => {
              console.error('复制失败:', err);
            });
        }
        
        // 检测用户代理
        function detectUserAgent() {
          const ua = navigator.userAgent;
          const isMobile = /Mobile|Android|iOS|iPhone|iPad|iPod/i.test(ua);
          
          if (isMobile) {
            document.body.style.fontSize = '14px';
          }
        }
        
        // 页面加载时执行
        window.addEventListener('load', () => {
          initTheme();
          detectUserAgent();
        });
        
        // 窗口大小变化时重新检测
        window.addEventListener('resize', detectUserAgent);
      </script>
    </body>
    </html>
  `;
}

/**
 * 生成KV未绑定提示页面
 * @param {string} lightBgImage - 浅色背景图URL
 * @param {string} darkBgImage - 深色背景图URL
 * @returns {string} KV未绑定提示页面HTML内容
 */
export function generateKvNotBoundPage(lightBgImage, darkBgImage) {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🌸樱花代理 - 配置错误</title>
      <style>
        /* 响应式CSS样式 */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
          min-height: 100vh;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          transition: background-image 0.5s ease;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          max-width: 600px;
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }
        h1 {
          color: #ff6b6b;
          font-size: 2.5rem;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
        }
        p {
          color: #333;
          font-size: 1.2rem;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .error-code {
          font-family: 'Courier New', monospace;
          background: rgba(255, 0, 0, 0.1);
          padding: 10px;
          border-radius: 5px;
          margin: 20px 0;
          font-size: 18px;
        }
        .instructions {
          text-align: left;
          background: rgba(255, 255, 255, 0.8);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .instructions ol {
          margin-left: 20px;
        }
        .instructions li {
          margin-bottom: 10px;
        }
        .toggle-theme {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
          transition: background 0.3s;
        }
        .toggle-theme:hover { background: rgba(255, 255, 255, 0.5); }
        
        /* 移动端适配 */
        @media (max-width: 600px) {
          body { padding: 10px; }
          .container { padding: 20px; }
          h1 { font-size: 2rem; }
          p { font-size: 1rem; }
        }
      </style>
    </head>
    <body id="kv-error-page">
      <button class="toggle-theme" id="theme-toggle">🌙</button>
      
      <div class="container">
        <h1>⚠️ 配置错误</h1>
        <p>无法使用樱花代理面板，因为未正确绑定KV数据库。</p>
        
        <div class="error-code">错误代码: KV_DATABASE_NOT_BOUND</div>
        
        <div class="instructions">
          <h3>解决方法:</h3>
          <ol>
            <li>登录到 Cloudflare 控制台</li>
            <li>创建一个 KV 命名空间</li>
            <li>在 Workers 设置中，将 KV 命名空间绑定到您的 Worker</li>
            <li>确保绑定名称为 <strong>KV数据库</strong></li>
            <li>重新部署您的 Worker</li>
          </ol>
        </div>
        
        <p>完成上述步骤后，刷新此页面即可正常使用樱花代理面板。</p>
      </div>
      
      <script>
        // 切换主题
        const themeToggle = document.getElementById('theme-toggle');
        const kvErrorPage = document.getElementById('kv-error-page');
        
        // 初始化主题
        function initTheme() {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
          
          if (savedTheme === 'dark') {
            kvErrorPage.style.backgroundImage = 'url(${darkBgImage})';
            themeToggle.textContent = '☀️';
          } else {
            kvErrorPage.style.backgroundImage = 'url(${lightBgImage})';
            themeToggle.textContent = '🌙';
          }
        }
        
        // 切换主题事件
        themeToggle.addEventListener('click', () => {
          const currentTheme = localStorage.getItem('theme') || 'light';
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          
          localStorage.setItem('theme', newTheme);
          
          if (newTheme === 'dark') {
            kvErrorPage.style.backgroundImage = 'url(${darkBgImage})';
            themeToggle.textContent = '☀️';
          } else {
            kvErrorPage.style.backgroundImage = 'url(${lightBgImage})';
            themeToggle.textContent = '🌙';
          }
        });
        
        // 页面加载时执行
        window.addEventListener('load', initTheme);
      </script>
    </body>
    </html>
  `;
}