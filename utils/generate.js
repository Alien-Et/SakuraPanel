// 配置生成模块
import { loadNodesAndConfig, getOrInitializeUUID, getNodePaths, addNodePath, removeNodePath, getProxyState, setProxyState, getNodeConfig, saveNodeConfig, getUserSettings, saveUserSettings } from './nodes.js';
import { validateUserSession, updateUserSessionActivity } from './auth.js';

/**
 * 生成猫咪配置
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} hostName - 主机名
 * @returns {Promise<string>} 猫咪配置内容
 */
export async function generateCatConfig(env, hostName) {
  try {
    // 获取节点列表
    const { nodes } = await loadNodesAndConfig(env);
    const currentNodeList = nodes.length > 0 ? nodes : [`${hostName}:443`];
    
    // 获取UUID
    const uuid = await getOrInitializeUUID(env);
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
    // 获取节点列表
    const { nodes } = await loadNodesAndConfig(env);
    const currentNodeList = nodes.length > 0 ? nodes : [`${hostName}:443`];
    
    // 获取UUID
    const uuid = await getOrInitializeUUID(env);
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
 * @param {string} hostName - 主机名
 * @param {string} lightBgImage - 浅色背景图URL
 * @param {string} darkBgImage - 深色背景图URL
 * @returns {string} 订阅页面HTML内容
 */
export function generateSubscriptionPage(uuid, hostName, lightBgImage, darkBgImage) {
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
          max-width: 800px;
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1, h2 { color: #333; text-align: center; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5); }
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
        
        /* 标签页样式 */
        .tabs {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .tab {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          border-radius: 5px 5px 0 0;
          margin-right: 5px;
          font-size: 16px;
          transition: background 0.3s;
        }
        .tab.active {
          background: rgba(255, 255, 255, 0.8);
          font-weight: bold;
        }
        .tab-content {
          background: rgba(255, 255, 255, 0.8);
          padding: 20px;
          border-radius: 0 10px 10px 10px;
          display: none;
        }
        .tab-content.active {
          display: block;
        }
        
        /* 文件上传样式 */
        .upload-area {
          border: 2px dashed #ccc;
          padding: 20px;
          text-align: center;
          border-radius: 10px;
          margin: 20px 0;
          cursor: pointer;
          transition: border-color 0.3s;
        }
        .upload-area:hover {
          border-color: #ff6b6b;
        }
        .upload-area input[type="file"] {
          display: none;
        }
        
        /* 代理设置样式 */
        .proxy-settings {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .proxy-setting {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .proxy-setting input[type="checkbox"] {
          width: 20px;
          height: 20px;
        }
        .proxy-setting select {
          padding: 8px;
          border-radius: 5px;
          border: 1px solid #ddd;
          flex: 1;
        }
        
        /* 节点路径列表样式 */
        .node-paths-list {
          max-height: 300px;
          overflow-y: auto;
          margin: 20px 0;
        }
        .node-path-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: rgba(0, 0, 0, 0.05);
          margin-bottom: 10px;
          border-radius: 5px;
        }
        .node-path-item button {
          background: #f44336;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
        }
        .node-path-item button:hover {
          background: #d32f2f;
        }
        
        /* 添加节点路径输入框样式 */
        .add-node-path {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .add-node-path input {
          flex: 1;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ddd;
        }
        
        /* 状态显示 */
        .status-display {
          background: rgba(0, 128, 0, 0.1);
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
          color: #006400;
        }
        
        /* 加载状态 */
        .loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #ff6b6b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body id="subscription-page">
      <button class="toggle-theme" id="theme-toggle">🌙</button>
      
      <div class="container">
        <h1>🌸樱花代理</h1>
        <h2>订阅管理中心</h2>
        
        <!-- 标签页 -->
        <div class="tabs">
          <button class="tab active" data-tab="subscription">订阅配置</button>
          <button class="tab" data-tab="proxy">代理设置</button>
          <button class="tab" data-tab="nodes">节点管理</button>
        </div>
        
        <!-- UUID显示 -->
        <div class="uuid-display">
          <span>当前UUID：${uuid}</span>
          <button class="copy-btn" onclick="copyToClipboard('${uuid}')">复制</button>
        </div>
        
        <!-- 订阅配置标签页内容 -->
        <div class="tab-content active" id="subscription">
          <div class="config-section">
            <h3>配置链接</h3>
            
            <div class="config-item">
              <h3>🐱 猫咪配置</h3>
              <div class="config-url" id="cat-config-url">https://${hostName}/config/cat?uuid=${uuid}</div>
              <div class="btn-group">
                <button class="action-btn" onclick="copyToClipboard(document.getElementById('cat-config-url').textContent)">复制链接</button>
                <a href="https://${hostName}/config/cat?uuid=${uuid}" target="_blank" class="action-btn">打开</a>
              </div>
            </div>
            
            <div class="config-item">
              <h3>🌐 通用配置</h3>
              <div class="config-url" id="universal-config-url">https://${hostName}/config/universal?uuid=${uuid}</div>
              <div class="btn-group">
                <button class="action-btn" onclick="copyToClipboard(document.getElementById('universal-config-url').textContent)">复制链接</button>
                <a href="https://${hostName}/config/universal?uuid=${uuid}" target="_blank" class="action-btn">打开</a>
              </div>
            </div>
          </div>
          
          <div class="btn-group">
            <button class="action-btn" onclick="changeUUID()">更换UUID</button>
          </div>
        </div>
        
        <!-- 代理设置标签页内容 -->
        <div class="tab-content" id="proxy">
          <form class="proxy-settings" id="proxyForm">
            <div class="proxy-setting">
              <input type="checkbox" id="proxyEnabled">
              <label for="proxyEnabled">启用代理</label>
            </div>
            
            <div class="proxy-setting">
              <input type="checkbox" id="forceProxy">
              <label for="forceProxy">强制代理模式</label>
            </div>
            
            <div class="proxy-setting">
              <label for="proxyType">代理类型：</label>
              <select id="proxyType">
                <option value="reverse">反向代理</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>
            
            <div class="status-display" id="proxyStatus">
              代理状态：加载中 <span class="loading"></span>
            </div>
            
            <button type="button" class="action-btn" onclick="saveProxySettings()">保存设置</button>
          </form>
        </div>
        
        <!-- 节点管理标签页内容 -->
        <div class="tab-content" id="nodes">
          <div class="upload-area" onclick="document.getElementById('ipFiles').click()">
            <input type="file" id="ipFiles" multiple accept=".txt">
            <div class="upload-text">
              <p>📁 点击或拖拽TXT文件到此区域上传IP节点</p>
              <p id="selectedFiles">(未选择任何文件)</p>
            </div>
          </div>
          
          <button type="button" class="action-btn" onclick="uploadIpFiles()">上传节点</button>
          
          <h3>节点文件路径管理</h3>
          <div class="node-paths-list" id="nodePathsList">
            加载中 <span class="loading"></span>
          </div>
          
          <div class="add-node-path">
            <input type="text" id="newNodePath" placeholder="输入新的节点文件URL">
            <button type="button" class="action-btn" onclick="addNodePath()">添加</button>
          </div>
        </div>
        
        <div class="btn-group">
          <button class="action-btn danger-btn" onclick="logout()">退出登录</button>
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
        
        // 标签页切换
        function setupTabs() {
          const tabs = document.querySelectorAll('.tab');
          tabs.forEach(tab => {
            tab.addEventListener('click', () => {
              // 移除所有活动状态
              tabs.forEach(t => t.classList.remove('active'));
              document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
              
              // 设置当前活动状态
              tab.classList.add('active');
              const tabId = tab.getAttribute('data-tab');
              document.getElementById(tabId).classList.add('active');
              
              // 如果是节点管理标签页，重新加载节点路径
              if (tabId === 'nodes') {
                loadNodePaths();
              }
              // 如果是代理设置标签页，重新加载代理状态
              if (tabId === 'proxy') {
                loadProxyStatus();
              }
            });
          });
        }
        
        // 更换UUID
        function changeUUID() {
          if (confirm('确定要更换UUID吗？这将会影响您的所有配置。')) {
            const button = event.target;
            const originalText = button.textContent;
            button.disabled = true;
            button.innerHTML = '更换中 <span class="loading"></span>';
            
            fetch('/config/change-uuid', {
              method: 'POST',
              credentials: 'same-origin'
            })
              .then(response => response.json())
              .then(data => {
                if (data.uuid) {
                  ;document.querySelector('.uuid-display span').textContent = `当前UUID：${data.uuid}`;
                  document.querySelector('.copy-btn').setAttribute('onclick', `copyToClipboard('${data.uuid}')`);
                  document.getElementById('cat-config-url').textContent = `https://${hostName}/config/cat?uuid=${data.uuid}`;
                  document.getElementById('universal-config-url').textContent = `https://${hostName}/config/universal?uuid=${data.uuid}`;
                  alert('UUID已成功更换！');
                }
              })
              .catch(err => {
                console.error('更换UUID失败:', err);
                alert('更换UUID失败，请重试。');
              })
              .finally(() => {
                button.disabled = false;
                button.textContent = originalText;
              });
          }
        }
        
        // 退出登录
        function logout() {
          if (confirm('确定要退出登录吗？')) {
            window.location.href = '/config/logout';
          }
        }
        
        // 上传IP文件
        function uploadIpFiles() {
          const ipFiles = document.getElementById('ipFiles').files;
          if (ipFiles.length === 0) {
            alert('请选择要上传的文件');
            return;
          }
          
          const formData = new FormData();
          for (let i = 0; i < ipFiles.length; i++) {
            formData.append('ipFiles', ipFiles[i]);
          }
          
          const button = event.target;
          const originalText = button.textContent;
          button.disabled = true;
          button.innerHTML = '上传中 <span class="loading"></span>';
          
          fetch('/config/upload', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
          })
            .then(response => response.json())
            .then(data => {
              if (data.error) {
                alert(`上传失败: ${data.error}`);
              } else if (data.message) {
                alert(data.message);
                if (data.message.includes('成功')) {
                  // 重置文件选择
                  document.getElementById('ipFiles').value = '';
                  document.getElementById('selectedFiles').textContent = '(未选择任何文件)';
                }
              }
            })
            .catch(err => {
              console.error('上传失败:', err);
              alert('上传失败，请重试。');
            })
            .finally(() => {
              button.disabled = false;
              button.textContent = originalText;
            });
        }
        
        // 监听文件选择
        document.getElementById('ipFiles').addEventListener('change', function() {
          const files = this.files;
          if (files.length === 0) {
            document.getElementById('selectedFiles').textContent = '(未选择任何文件)';
          } else if (files.length === 1) {
            document.getElementById('selectedFiles').textContent = `已选择: ${files[0].name}`;
          } else {
            document.getElementById('selectedFiles').textContent = `已选择: ${files.length} 个文件`;
          }
        });
        
        // 加载节点路径
        function loadNodePaths() {
          const nodePathsList = document.getElementById('nodePathsList');
          nodePathsList.innerHTML = '加载中 <span class="loading"></span>';
          
          fetch('/config/get-node-paths', {
            method: 'GET',
            credentials: 'same-origin'
          })
            .then(response => response.json())
            .then(data => {
              if (data.paths && Array.isArray(data.paths)) {
                if (data.paths.length === 0) {
                  nodePathsList.innerHTML = '<p>暂无节点文件路径</p>';
                } else {
                  nodePathsList.innerHTML = '';
                  data.paths.forEach((path, index) => {
                    const pathItem = document.createElement('div');
                    pathItem.className = 'node-path-item';
                    pathItem.innerHTML = `
                      <span>${path}</span>
                      <button onclick="removeNodePath(${index})">&times;</button>
                    `;
                    nodePathsList.appendChild(pathItem);
                  });
                }
              }
            })
            .catch(err => {
              console.error('加载节点路径失败:', err);
              nodePathsList.innerHTML = '<p class="error-message">加载失败，请重试</p>';
            });
        }
        
        // 添加节点路径
        function addNodePath() {
          const newPathInput = document.getElementById('newNodePath');
          const newPath = newPathInput.value.trim();
          
          if (!newPath) {
            alert('请输入节点文件URL');
            return;
          }
          
          const button = event.target;
          const originalText = button.textContent;
          button.disabled = true;
          button.innerHTML = '添加中 <span class="loading"></span>';
          
          fetch('/config/add-node-path', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path: newPath }),
            credentials: 'same-origin'
          })
            .then(response => response.json())
            .then(data => {
              if (data.error) {
                alert(`添加失败: ${data.error}`);
              } else if (data.success) {
                newPathInput.value = '';
                loadNodePaths();
              }
            })
            .catch(err => {
              console.error('添加节点路径失败:', err);
              alert('添加失败，请重试。');
            })
            .finally(() => {
              button.disabled = false;
              button.textContent = originalText;
            });
        }
        
        // 移除节点路径
        function removeNodePath(index) {
          if (confirm('确定要移除这个节点文件路径吗？')) {
            fetch('/config/remove-node-path', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ index: index }),
              credentials: 'same-origin'
            })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  loadNodePaths();
                } else if (data.error) {
                  alert(`移除失败: ${data.error}`);
                }
              })
              .catch(err => {
                console.error('移除节点路径失败:', err);
                alert('移除失败，请重试。');
              });
          }
        }
        
        // 加载代理状态
        function loadProxyStatus() {
          const proxyStatus = document.getElementById('proxyStatus');
          proxyStatus.innerHTML = '代理状态：加载中 <span class="loading"></span>';
          
          fetch('/get-proxy-status', {
            method: 'GET'
          })
            .then(response => response.json())
            .then(data => {
              if (data.status) {
                proxyStatus.textContent = `代理状态：${data.status}`;
              }
            })
            .catch(err => {
              console.error('加载代理状态失败:', err);
              proxyStatus.textContent = '代理状态：加载失败';
            });
        }
        
        // 保存代理设置
        function saveProxySettings() {
          const proxyEnabled = document.getElementById('proxyEnabled').checked;
          const forceProxy = document.getElementById('forceProxy').checked;
          const proxyType = document.getElementById('proxyType').value;
          
          const formData = new FormData();
          formData.append('proxyEnabled', proxyEnabled ? 'true' : 'false');
          formData.append('forceProxy', forceProxy ? 'true' : 'false');
          formData.append('proxyType', proxyType);
          
          fetch('/set-proxy-state', {
            method: 'POST',
            body: formData
          })
            .then(() => {
              alert('代理设置已保存！');
              loadProxyStatus();
            })
            .catch(err => {
              console.error('保存代理设置失败:', err);
              alert('保存失败，请重试。');
            });
        }
        
        // 页面加载时执行
        window.addEventListener('load', () => {
          initTheme();
          detectUserAgent();
          setupTabs();
          loadProxyStatus();
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

/**
 * 处理文件上传
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {Request} request - 请求对象
 * @param {string} uuid - 用户UUID
 * @returns {Promise<Response>} 响应对象
 */
export async function handleFileUpload(env, request, uuid) {
  try {
    // 验证用户会话
    const isValidSession = await validateUserSession(env, uuid);
    if (!isValidSession) {
      return new Response('未授权的访问', { status: 401 });
    }
    
    // 更新用户会话活动时间
    await updateUserSessionActivity(env, uuid);
    
    // 检查Content-Type是否为multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response('无效的Content-Type', { status: 400 });
    }
    
    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response('未找到文件', { status: 400 });
    }
    
    // 获取文件内容
    const fileContent = await file.arrayBuffer();
    const fileName = file.name;
    const fileType = file.type || 'application/octet-stream';
    
    // 生成文件ID
    const fileId = generateUUID();
    
    // 存储文件信息到KV数据库
    const fileInfo = {
      id: fileId,
      name: fileName,
      type: fileType,
      size: fileContent.byteLength,
      uploadedAt: new Date().toISOString(),
      uploadedBy: uuid
    };
    
    await env.KV数据库.put(`file_${fileId}`, JSON.stringify(fileInfo));
    await env.KV数据库.put(`file_content_${fileId}`, fileContent);
    
    // 添加到用户文件列表
    const fileListKey = `file_list_${uuid}`;
    const fileListData = await env.KV数据库.get(fileListKey);
    const fileList = fileListData ? JSON.parse(fileListData) : [];
    
    if (!fileList.includes(fileId)) {
      fileList.push(fileId);
      await env.KV数据库.put(fileListKey, JSON.stringify(fileList));
    }
    
    // 返回成功响应
    return new Response(JSON.stringify({
      success: true,
      fileId,
      fileName,
      fileSize: fileContent.byteLength
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('处理文件上传失败:', error);
    return new Response('文件上传失败', { status: 500 });
  }
}

/**
 * 处理文件下载
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} fileId - 文件ID
 * @param {string} uuid - 用户UUID
 * @returns {Promise<Response>} 响应对象
 */
export async function handleFileDownload(env, fileId, uuid) {
  try {
    // 验证用户会话
    const isValidSession = await validateUserSession(env, uuid);
    if (!isValidSession) {
      return new Response('未授权的访问', { status: 401 });
    }
    
    // 更新用户会话活动时间
    await updateUserSessionActivity(env, uuid);
    
    // 获取文件信息
    const fileInfo = await env.KV数据库.get(`file_${fileId}`);
    if (!fileInfo) {
      return new Response('文件不存在', { status: 404 });
    }
    
    const fileInfoObj = JSON.parse(fileInfo);
    
    // 检查文件是否属于当前用户
    if (fileInfoObj.uploadedBy !== uuid) {
      return new Response('无权访问此文件', { status: 403 });
    }
    
    // 获取文件内容
    const fileContent = await env.KV数据库.get(`file_content_${fileId}`, 'arrayBuffer');
    if (!fileContent) {
      return new Response('文件内容不存在', { status: 404 });
    }
    
    // 返回文件内容
    return new Response(fileContent, {
      status: 200,
      headers: {
        'Content-Type': fileInfoObj.type,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileInfoObj.name)}"`,
        'Content-Length': fileInfoObj.size.toString()
      }
    });
  } catch (error) {
    console.error('处理文件下载失败:', error);
    return new Response('文件下载失败', { status: 500 });
  }
}

/**
 * 获取用户文件列表
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} uuid - 用户UUID
 * @returns {Promise<Response>} 响应对象
 */
export async function getUserFiles(env, uuid) {
  try {
    // 验证用户会话
    const isValidSession = await validateUserSession(env, uuid);
    if (!isValidSession) {
      return new Response('未授权的访问', { status: 401 });
    }
    
    // 更新用户会话活动时间
    await updateUserSessionActivity(env, uuid);
    
    // 获取所有文件ID列表
    const fileListKey = `file_list_${uuid}`;
    const fileListData = await env.KV数据库.get(fileListKey);
    const fileList = fileListData ? JSON.parse(fileListData) : [];
    
    // 获取每个文件的详细信息
    const files = [];
    for (const fileId of fileList) {
      const fileInfo = await env.KV数据库.get(`file_${fileId}`);
      if (fileInfo) {
        files.push(JSON.parse(fileInfo));
      }
    }
    
    // 返回文件列表
    return new Response(JSON.stringify({
      success: true,
      files
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('获取用户文件列表失败:', error);
    return new Response('获取文件列表失败', { status: 500 });
  }
}

/**
 * 删除文件
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} fileId - 文件ID
 * @param {string} uuid - 用户UUID
 * @returns {Promise<Response>} 响应对象
 */
export async function deleteFile(env, fileId, uuid) {
  try {
    // 验证用户会话
    const isValidSession = await validateUserSession(env, uuid);
    if (!isValidSession) {
      return new Response('未授权的访问', { status: 401 });
    }
    
    // 更新用户会话活动时间
    await updateUserSessionActivity(env, uuid);
    
    // 获取文件信息
    const fileInfo = await env.KV数据库.get(`file_${fileId}`);
    if (!fileInfo) {
      return new Response('文件不存在', { status: 404 });
    }
    
    const fileInfoObj = JSON.parse(fileInfo);
    
    // 检查文件是否属于当前用户
    if (fileInfoObj.uploadedBy !== uuid) {
      return new Response('无权删除此文件', { status: 403 });
    }
    
    // 删除文件信息和内容
    await env.KV数据库.delete(`file_${fileId}`);
    await env.KV数据库.delete(`file_content_${fileId}`);
    
    // 从用户文件列表中移除
    const fileListKey = `file_list_${uuid}`;
    const fileListData = await env.KV数据库.get(fileListKey);
    if (fileListData) {
      const fileList = JSON.parse(fileListData);
      const index = fileList.indexOf(fileId);
      if (index !== -1) {
        fileList.splice(index, 1);
        await env.KV数据库.put(fileListKey, JSON.stringify(fileList));
      }
    }
    
    // 返回成功响应
    return new Response(JSON.stringify({
      success: true,
      message: '文件删除成功'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    return new Response('文件删除失败', { status: 500 });
  }
}
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