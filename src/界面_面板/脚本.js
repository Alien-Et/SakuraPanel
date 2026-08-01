// ====================== 订阅面板界面 - 脚本 ======================
import { 脚本 as 花瓣脚本 } from '../界面_主题/花瓣效果.js';

export function 生成脚本(参数) {
  const { 默认白天背景图, 默认暗黑背景图, 配置路径, hostName } = 参数;
  return `
    const lightBg = '${默认白天背景图}';
    const darkBg = '${默认暗黑背景图}';
    const bgImage = document.getElementById('backgroundImage');

    async function 获取壁纸地址() {
      try {
        const response = await fetch('/get-wallpaper');
        if (response.ok) {
          const data = await response.json();
          return {
            light: data.lightWallpaper || '${默认白天背景图}',
            dark: data.darkWallpaper || '${默认暗黑背景图}'
          };
        }
      } catch (error) {
        console.error('获取壁纸地址失败:', error);
      }
      return {
        light: '${默认白天背景图}',
        dark: '${默认暗黑背景图}'
      };
    }

    async function updateBackground() {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const wallpaper = await 获取壁纸地址();
      bgImage.src = isDarkMode ? wallpaper.dark : wallpaper.light;
      bgImage.onerror = () => { bgImage.style.display = 'none'; };
    }
    updateBackground();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateBackground);

    // 全局变量，用于存储从服务器获取的状态
    let proxyEnabled = true;
    let proxyType = 'reverse';
    let forceProxy = false;
    let b64Enabled = true; // b64状态也从服务器获取
    let airportName = '樱花订阅'; // 机场名称
    let echEnabled = true; // ECH 状态
    let echSNI = '';        // ECH SNI
    let echDNS = 'https://dns.alidns.com/dns-query'; // ECH DNS
    let subTokenEnabled = true; // 订阅Token验证
    let subToken = ''; // 订阅Token值
    let subInfoEnabled = false; // 流量信息显示

    // 页面加载时，从服务器初始化所有设置
    async function initializeSettings() {
      try {
        // 获取代理设置
        const proxyRes = await fetch('/get-proxy-settings');
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          proxyEnabled = proxyData.proxyEnabled;
          proxyType = proxyData.proxyType;
          forceProxy = proxyData.forceProxy;
          document.getElementById('proxyIPInput').value = proxyData.proxyIP || '';
          document.getElementById('socks5Input').value = proxyData.socks5 || '';
        }

        // 获取B64加密设置
        const b64Res = await fetch('/get-b64-status');
        if (b64Res.ok) {
          const b64Data = await b64Res.json();
          b64Enabled = b64Data.b64Enabled;
        }

        // 获取机场名称设置
        const airportRes = await fetch('/get-airport-name');
        if (airportRes.ok) {
          const airportData = await airportRes.json();
          airportName = airportData.airportName;
        }

        // 获取 ECH 设置
        const echRes = await fetch('/get-ech-config');
        if (echRes.ok) {
          const echData = await echRes.json();
          echEnabled = echData.echEnabled;
          echSNI = echData.echSNI;
          echDNS = echData.echDNS;
        }

        // 获取订阅Token设置
        const subTokenRes = await fetch('/get-sub-token');
        if (subTokenRes.ok) {
          const subTokenData = await subTokenRes.json();
          subTokenEnabled = subTokenData.subTokenEnabled;
          subToken = subTokenData.subToken || '';
        }

        // 获取CF凭证设置
        const cfRes = await fetch('/get-cf-credentials');
        if (cfRes.ok) {
          const cfData = await cfRes.json();
          subInfoEnabled = cfData.subInfoEnabled;
          document.getElementById('cfAccountIdInput').value = cfData.accountId || '';
          // 脱敏字段：真实值存 data-original，输入框显示脱敏值
          const 脱敏字段 = [
            { el: document.getElementById('cfApiTokenInput'), val: cfData.apiToken || '' },
            { el: document.getElementById('cfEmailInput'), val: cfData.email || '' },
            { el: document.getElementById('cfGlobalApiKeyInput'), val: cfData.globalApiKey || '' }
          ];
          脱敏字段.forEach(({ el, val }) => {
            el.dataset.original = val;
            if (val) {
              el.value = val.length > 4 ? val.slice(0, 2) + '••••' + val.slice(-2) : '••••';
              el.setAttribute('data-masked', '1');
            } else {
              el.value = '';
              el.removeAttribute('data-masked');
            }
          });
          // 根据已保存的凭证自动选择认证方式
          const method = cfData.authMethod || (cfData.apiToken ? 'token' : (cfData.email ? 'email' : 'token'));
          document.getElementById('cfAuthMethod').value = method;
          切换CF认证方式();
        }
      } catch (error) {
        console.error('初始化设置失败:', error);
        alert('从服务器同步设置失败，请刷新页面重试。');
      } finally {
        // 无论成功与否，都根据当前变量状态更新UI
        document.getElementById('proxyToggle').checked = proxyEnabled;
        document.getElementById('forceProxyToggle').checked = forceProxy;
        document.getElementById('b64Toggle').checked = b64Enabled;
        document.getElementById('echToggle').checked = echEnabled;
        document.getElementById('echSNIInput').value = echSNI;
        // DNS 输入框：只有用户显式设置过的非默认值才显示，留空表示使用默认
        const 默认DNS = 'https://dns.alidns.com/dns-query';
        document.getElementById('echDNSInput').value = (echDNS && echDNS !== 默认DNS) ? echDNS : '';
        document.getElementById('subTokenToggle').checked = subTokenEnabled;

        updateProxyUI();
        updateProxyStatus();
        updateB64Status();
        updateAirportStatus();
        updateEchStatus();
        updateSubTokenStatus();
        updateSubLinks();
        刷新用量();
      }
    }

    // 确保DOM加载完毕后再执行初始化
    document.addEventListener('DOMContentLoaded', initializeSettings);

    function 加载节点路径() {
      fetch('/${配置路径}/get-node-paths')
        .then(response => response.json())
        .then(data => {
          const urlList = document.getElementById('urlList');
          urlList.innerHTML = '';
          data.paths.forEach((path, index) => {
            const div = document.createElement('div');
            div.className = 'url-item';
            div.innerHTML = '<span>' + path + '</span><button onclick="移除节点路径(' + index + ')">移除</button>';
            urlList.appendChild(div);
          });
        })
        .catch(() => alert('加载节点路径失败，请稍后再试~'));
    }

    function 添加节点路径() {
      const urlInput = document.getElementById('nodeUrlInput');
      const url = urlInput.value.trim();
      if (!url) {
        alert('喂！大臭宝，请输入有效的 URL 哦~');
        return;
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL 必须以 http:// 或 https:// 开头哦~');
        return;
      }
      fetch('/${配置路径}/add-node-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: url })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            urlInput.value = '';
            加载节点路径();
            alert(data.消息 || '路径添加成功！');
          } else {
            alert(data.error || '添加失败，请稍后再试~');
          }
        })
        .catch(() => alert('添加失败，网络出错啦~'));
    }

    function 移除节点路径(index) {
      fetch('/${配置路径}/remove-node-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            加载节点路径();
            alert('路径移除成功！');
          } else {
            alert(data.error || '移除失败，请稍后再试~');
          }
        })
        .catch(() => alert('移除失败，网络出错啦~'));
    }

    加载节点路径();

    function toggleProxy() {
      proxyEnabled = document.getElementById('proxyToggle').checked;
      updateProxyUI();
      saveProxyState();
      updateProxyStatus();
    }

    function toggleForceProxy() {
      forceProxy = document.getElementById('forceProxyToggle').checked;
      saveProxyState();
      updateProxyStatus();
      updateProxyUI();
    }

    function switchProxyType(type) {
      proxyType = type;
      updateProxyUI();
      saveProxyState();
      updateProxyStatus();
    }

    function updateProxyUI() {
      const forceProxyRow = document.getElementById('forceProxyRow');
      const forceProxyNote = document.getElementById('forceProxyNote');
      const forceProxyText = document.getElementById('forceProxyText');
      const proxyCapsule = document.getElementById('proxyCapsule');
      const proxyFieldGroup = document.getElementById('proxyFieldGroup');
      const options = document.querySelectorAll('.proxy-option');

      forceProxyRow.style.display = proxyEnabled ? 'flex' : 'none';
      forceProxyNote.style.display = proxyEnabled ? 'block' : 'none';
      proxyCapsule.style.display = proxyEnabled ? 'flex' : 'none';
      proxyFieldGroup.style.display = proxyEnabled ? 'block' : 'none';
      options.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.type === proxyType);
      });
      // 移动玻璃拟态滑块到当前选中项
      const segmentThumb = document.getElementById('proxySegmentThumb');
      if (segmentThumb) segmentThumb.style.transform = proxyType === 'socks5' ? 'translateX(100%)' : 'translateX(0)';
      // 根据代理类型切换显示对应的地址输入框
      document.getElementById('reverseField').style.display = proxyType === 'reverse' ? '' : 'none';
      document.getElementById('socks5Field').style.display = proxyType === 'socks5' ? '' : 'none';

      if (proxyEnabled) {
        forceProxyText.textContent = forceProxy
          ? '强制代理开启后，您的出口将固定为代理服务器的归属地。'
          : '动态代理将优先尝试直连，失败时自动切换至代理。';
      }
    }

    function updateProxyStatus() {
      const statusElement = document.getElementById('proxyStatus');
      if (!proxyEnabled) {
        statusElement.textContent = '直连';
        statusElement.className = 'proxy-status direct';
      } else {
        fetch('/get-proxy-status')
          .then(response => response.json())
          .then(data => {
            let statusText = data.status;
            if (data.连接地址) {
              statusText += '：' + data.连接地址;
            }
            statusElement.textContent = statusText;
            statusElement.className = 'proxy-status ' + (data.status === '直连' ? 'direct' : 'success');
          })
          .catch(() => {
            statusElement.textContent = '直连';
            statusElement.className = 'proxy-status direct';
          });
      }
    }

    function toggleB64() {
      b64Enabled = document.getElementById('b64Toggle').checked;
      // 先保存状态到服务器，确保状态同步
      saveB64State().then(() => {
        updateB64Status();
        // 状态保存成功后再生成和保存配置
        generateAndSaveConfigs();
      }).catch(error => {
        console.error('保存加密状态失败:', error);
        alert('切换加密状态失败，请重试');
        // 恢复开关状态
        document.getElementById('b64Toggle').checked = !b64Enabled;
        b64Enabled = !b64Enabled;
        updateB64Status();
      });
    }

    function generateAndSaveConfigs() {
      // 生成猫咪配置
      fetch('/${配置路径}/generate-cat-config', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('猫咪配置已生成并保存');
          } else {
            console.error('猫咪配置生成失败:', data.error);
          }
        })
        .catch(error => console.error('猫咪配置生成请求失败:', error));

      // 生成通用配置
      fetch('/${配置路径}/generate-universal-config', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('通用配置已生成并保存');
          } else {
            console.error('通用配置生成失败:', data.error);
          }
        })
        .catch(error => console.error('通用配置生成请求失败:', error));
    }

    function saveB64State() {
      const formData = new FormData();
      formData.append('b64Enabled', b64Enabled);
      // 返回Promise以便调用者知道何时完成
      return fetch('/set-b64-state', { method: 'POST', body: formData })
        .then(response => {
          if (!response.ok) {
            throw new Error('保存失败，服务器响应错误');
          }
          updateB64Status();
        });
    }

    function updateB64Status() {
      const statusElement = document.getElementById('b64Status');
      if (b64Enabled) {
        statusElement.textContent = '当前订阅链接已Base64加密';
        statusElement.className = 'proxy-status success';
      } else {
        statusElement.textContent = '当前订阅链接未加密';
        statusElement.className = 'proxy-status direct';
      }
    }

    // ====================== ECH 设置 ======================
    async function toggleEch() {
      const toggle = document.getElementById('echToggle');
      echEnabled = toggle.checked;
      const formData = new FormData();
      formData.append('echEnabled', String(echEnabled));
      try {
        const res = await fetch('/set-ech-state', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('保存失败');
        alert(echEnabled ? '已启用 ECH' : '已关闭 ECH');
        updateEchStatus();
        // 立即重新生成猫咪配置，使新设置生效
        generateAndSaveConfigs();
      } catch (error) {
        console.error('保存 ECH 状态失败:', error);
        alert('切换 ECH 状态失败，请重试');
        toggle.checked = !echEnabled;
        echEnabled = !echEnabled;
      }
    }

    async function 保存Ech设置() {
      const sni = document.getElementById('echSNIInput').value.trim();
      const dns = document.getElementById('echDNSInput').value.trim();
      const formData = new FormData();
      formData.append('echSNI', sni);
      formData.append('echDNS', dns);
      try {
        const res = await fetch('/set-ech-config', { method: 'POST', body: formData });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error('HTTP ' + res.status + ' ' + txt);
        }
        echSNI = sni;
        echDNS = dns || 'https://dns.alidns.com/dns-query';
        alert('ECH 设置已保存');
        updateEchStatus();
        // 重新生成猫咪配置
        generateAndSaveConfigs();
      } catch (error) {
        console.error('保存 ECH 设置失败:', error);
        alert('保存 ECH 设置失败：' + error.message);
      }
    }

    async function 恢复Ech默认() {
      if (!confirm('确定要恢复 ECH 默认设置吗？')) return;
      // 清空两个输入框，保存默认值
      document.getElementById('echSNIInput').value = '';
      document.getElementById('echDNSInput').value = '';
      const formData = new FormData();
      formData.append('echSNI', '');
      formData.append('echDNS', 'https://dns.alidns.com/dns-query');
      try {
        const res = await fetch('/set-ech-config', { method: 'POST', body: formData });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error('config HTTP ' + res.status);
        }
        echSNI = '';
        echDNS = 'https://dns.alidns.com/dns-query';
        document.getElementById('echToggle').checked = false;
        echEnabled = false;
        const stateForm = new FormData();
        stateForm.append('echEnabled', 'false');
        const res2 = await fetch('/set-ech-state', { method: 'POST', body: stateForm });
        if (!res2.ok) {
          const txt = await res2.text();
          throw new Error('state HTTP ' + res2.status);
        }
        alert('已恢复 ECH 默认设置');
        updateEchStatus();
        generateAndSaveConfigs();
      } catch (error) {
        console.error('恢复 ECH 默认失败:', error);
        alert('恢复 ECH 默认失败：' + error.message);
      }
    }

    function updateEchStatus() {
      const statusElement = document.getElementById('echStatus');
      if (echEnabled) {
        const sniText = echSNI ? ', SNI: ' + echSNI : '';
        statusElement.textContent = '当前已启用 ECH' + sniText;
        statusElement.className = 'proxy-status success';
      } else {
        statusElement.textContent = '当前未启用 ECH';
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

    async function 保存代理地址() {
      const proxyIP = document.getElementById('proxyIPInput').value.trim();
      const socks5 = document.getElementById('socks5Input').value.trim();
      const formData = new FormData();
      formData.append('proxyEnabled', proxyEnabled);
      formData.append('proxyType', proxyType);
      formData.append('forceProxy', forceProxy);
      formData.append('proxyIP', proxyIP);
      formData.append('socks5', socks5);
      try {
        const res = await fetch('/set-proxy-state', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('保存失败');
        alert('代理地址已保存');
        updateProxyStatus();
      } catch (error) {
        alert('保存代理地址失败：' + error.message);
      }
    }

    function 导入Config(配置路径, hostName, type) {
      const tokenParam = subTokenEnabled && subToken ? '?token=' + subToken : '';
      window.location.href = type + '://install-config?url=https://' + hostName + '/' + 配置路径 + '/' + type + tokenParam;
    }

    function 更换UUID() {
      fetch('/${配置路径}/change-uuid', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          if (data.uuid) {
            document.getElementById('currentUUID').textContent = data.uuid;
            // 重新获取Token（因为Token基于UUID生成）
            fetch('/get-sub-token').then(r => r.json()).then(d => {
              subToken = d.subToken || '';
              updateSubTokenStatus();
              updateSubLinks();
            });
            alert('UUID 已更换成功！请重新获取订阅链接~');
          } else {
            alert('更换 UUID 失败，请稍后再试~');
          }
        })
        .catch(() => alert('更换 UUID 失败，网络出错啦~'));
    }

    function 显示文件() {
      const fileInput = document.getElementById('ipFiles');
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '';
      Array.from(fileInput.files).forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = '<span>' + file.name + ' (' + (file.size / 1024).toFixed(2) + ' KB)</span><button onclick="移除文件(' + index + ')">移除</button>';
        fileList.appendChild(div);
      });
    }

    function 移除文件(index) {
      const fileInput = document.getElementById('ipFiles');
      const dt = new DataTransfer();
      Array.from(fileInput.files).forEach((file, i) => { if (i !== index) dt.items.add(file); });
      fileInput.files = dt.files;
      显示文件();
    }

    function 开始上传(event) {
      event.preventDefault();
      const form = document.getElementById('uploadForm');
      const progressContainer = document.getElementById('progressContainer');
      const progressFill = document.getElementById('progressFill');
      const progressText = document.getElementById('progressText');
      const formData = new FormData(form);

      if (!formData.getAll('ipFiles').length) {
        alert('喂！大臭宝，请先选择文件哦~');
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
                window.location.href = response.Location || '/${配置路径}';
              }, 500);
            } else {
              throw new Error('响应格式错误');
            }
          } else {
            throw new Error(response.error || '未知错误');
          }
        } catch (err) {
          progressContainer.style.display = 'none';
          alert('上传失败啦，状态码: ' + xhr.status + '，原因: ' + err.message);
        }
      };

      xhr.onerror = function() {
        progressContainer.style.display = 'none';
        alert('网络坏掉了，喂！大臭宝请检查一下哦~');
      };

      xhr.send(formData);
    }

    let lastUA = navigator.userAgent;
    function checkUAChange() {
      const currentUA = navigator.userAgent;
      if (currentUA !== lastUA) {
        console.log('UA 已切换，从', lastUA, '到', currentUA);
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
      // updateProxyUI() is called inside initializeSettings, so we can remove it from here
      初始化壁纸设置();

      // 标题滚动渐隐：向下滚动时标题逐渐淡出
      const panelHeader = document.querySelector('.panel-header');
      if (panelHeader) {
        let 滚动锁 = false;
        const 更新标题渐隐 = () => {
          const progress = Math.min(window.scrollY / 200, 1);
          const flyOffset = -progress * progress * 300;
          const opacity = Math.max(0, 1 - progress * 1.4);
          const scale = 1 - progress * 0.25;
          const rotate = -progress * 4;
          const blur = progress * 4;
          panelHeader.style.transform = 'translateY(' + flyOffset + 'px) scale(' + scale + ') rotate(' + rotate + 'deg)';
          panelHeader.style.opacity = opacity;
          panelHeader.style.filter = 'blur(' + blur + 'px)';
          panelHeader.style.pointerEvents = opacity < 0.1 ? 'none' : '';
          滚动锁 = false;
        };
        window.addEventListener('scroll', () => {
          if (!滚动锁) {
            滚动锁 = true;
            requestAnimationFrame(更新标题渐隐);
          }
        }, { passive: true });
      }

      // 副标题打字机效果（多句诗情画意循环）
      const 副标题 = document.querySelector('.panel-subtitle');
      if (副标题) {
        const 诗句 = ['落樱缤纷，静待君来', '云端漫步，联通山海', '一树樱花一树诗', '花谢花飞，云卷云舒'];
        let 句索引 = 0, idx = 0, 删除中 = false;
        const 打字 = () => {
          const 当前句 = 诗句[句索引];
          if (!删除中) {
            idx++;
            副标题.textContent = 当前句.slice(0, idx);
            if (idx >= 当前句.length) {
              setTimeout(() => { 删除中 = true; 打字(); }, 1800);
              return;
            }
            setTimeout(打字, 90);
          } else {
            idx--;
            副标题.textContent = 当前句.slice(0, idx);
            if (idx <= 0) {
              删除中 = false;
              句索引 = (句索引 + 1) % 诗句.length;
              setTimeout(打字, 400);
              return;
            }
            setTimeout(打字, 45);
          }
        };
        副标题.innerHTML = '';
        打字();
      }
    });

    // 保存壁纸设置函数
    async function 保存壁纸设置() {
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
          alert('壁纸设置保存成功！');
          // 更新预览
          updateWallpaperPreview();
          // 更新背景图
          updateBackground();
        } else {
          const errorData = await response.json();
          alert('保存失败：' + (errorData.error || '未知错误'));
        }
      } catch (error) {
        alert('保存失败：网络错误');
        console.error('保存壁纸设置失败:', error);
      }
    }

    // 恢复默认壁纸函数
    async function 恢复默认壁纸() {
      if (!confirm('确定要恢复默认壁纸吗？')) {
        return;
      }

      try {
        const response = await fetch('/reset-wallpaper', {
          method: 'POST'
        });

        if (response.ok) {
          alert('默认壁纸已恢复！');
          // 清空输入框
          document.getElementById('lightWallpaperInput').value = '';
          document.getElementById('darkWallpaperInput').value = '';
          // 更新预览
          updateWallpaperPreview();
          // 更新背景图
          updateBackground();
        } else {
          const errorData = await response.json();
          alert('恢复失败：' + (errorData.error || '未知错误'));
        }
      } catch (error) {
        alert('恢复失败：网络错误');
        console.error('恢复默认壁纸失败:', error);
      }
    }

    // 更新壁纸预览函数（已移除预览功能）
    function updateWallpaperPreview() {
      // 预览功能已移除，此函数保留用于兼容性
    }

    // 页面加载时初始化壁纸设置
    async function 初始化壁纸设置() {
      try {
        const response = await fetch('/get-wallpaper');
        if (response.ok) {
          const data = await response.json();
          document.getElementById('lightWallpaperInput').value = data.lightWallpaper || '';
          document.getElementById('darkWallpaperInput').value = data.darkWallpaper || '';
          updateWallpaperPreview();
        }
      } catch (error) {
        console.error('初始化壁纸设置失败:', error);
      }
    }

    // 保存机场设置函数
    async function 保存机场设置() {
      const airportNameInput = document.getElementById('airportNameInput').value.trim();
      const finalAirportName = airportNameInput || '樱花订阅';

      try {
        const formData = new FormData();
        formData.append('airportName', finalAirportName);

        const response = await fetch('/set-airport-name', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          airportName = finalAirportName;
          updateAirportStatus();
          alert('机场设置保存成功！');
        } else {
          alert('机场设置保存失败，请重试。');
        }
      } catch (error) {
        console.error('保存机场设置失败:', error);
        alert('保存机场设置失败，请检查网络连接。');
      }
    }

    // 恢复默认机场函数
    async function 恢复默认机场() {
      document.getElementById('airportNameInput').value = '樱花订阅';
      await 保存机场设置();
    }

    // 更新机场状态显示
    function updateAirportStatus() {
      document.getElementById('airportStatus').textContent = '当前机场：' + airportName;
      document.getElementById('airportNameInput').value = airportName;
    }

    // 输入框变化时实时更新预览（已移除预览功能）
    // document.getElementById('lightWallpaperInput').addEventListener('input', updateWallpaperPreview);
    // document.getElementById('darkWallpaperInput').addEventListener('input', updateWallpaperPreview);

    // ====================== 订阅Token验证 ======================
    async function toggleSubToken() {
      subTokenEnabled = document.getElementById('subTokenToggle').checked;
      const formData = new FormData();
      formData.append('subTokenEnabled', subTokenEnabled);
      try {
        const res = await fetch('/set-sub-token-state', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('保存失败');
        updateSubTokenStatus();
        updateSubLinks();
      } catch (error) {
        alert('切换Token验证失败，请重试');
        document.getElementById('subTokenToggle').checked = !subTokenEnabled;
        subTokenEnabled = !subTokenEnabled;
      }
    }

    function updateSubTokenStatus() {
      const statusElement = document.getElementById('subTokenStatus');
      const tokenBox = document.getElementById('subTokenBox');
      if (subTokenEnabled) {
        statusElement.textContent = '已启用Token验证，订阅链接需带?token=参数';
        statusElement.className = 'proxy-status success';
        tokenBox.style.display = 'block';
        document.getElementById('subTokenValue').textContent = subToken || '请先更换UUID以生成Token';
      } else {
        statusElement.textContent = '当前未启用Token验证';
        statusElement.className = 'proxy-status direct';
        tokenBox.style.display = 'none';
      }
    }

    // ====================== CF请求统计 ======================
    // 脱敏输入框：聚焦时显示真实值，失焦时恢复脱敏显示
    function cfFocus(el) {
      if (el.dataset.masked) {
        el.value = el.dataset.original || '';
        el.removeAttribute('data-masked');
      }
    }

    function cfBlur(el) {
      const val = el.value.trim();
      if (val === el.dataset.original) {
        // 未修改，恢复脱敏
        if (val) {
          el.value = val.length > 4 ? val.slice(0, 2) + '••••' + val.slice(-2) : '••••';
          el.setAttribute('data-masked', '1');
        }
      }
    }

    function 切换CF认证方式() {
      const method = document.getElementById('cfAuthMethod').value;
      document.getElementById('cfTokenFields').style.display = method === 'token' ? '' : 'none';
      document.getElementById('cfEmailFields').style.display = method === 'email' ? '' : 'none';
    }

    // 获取输入框的真实值（脱敏时取 data-original）
    function 获取CF输入值(id) {
      const el = document.getElementById(id);
      if (el.dataset.masked) return el.dataset.original || '';
      return el.value.trim();
    }

    // 校验当前认证方式的字段完整性
    function 校验CF凭证() {
      const method = document.getElementById('cfAuthMethod').value;
      if (method === 'token') {
        const accountId = document.getElementById('cfAccountIdInput').value.trim();
        const apiToken = 获取CF输入值('cfApiTokenInput');
        if (!accountId || !apiToken) {
          alert('请填写完整的 API Token 认证信息（Account ID + API Token）');
          return false;
        }
      } else {
        const email = 获取CF输入值('cfEmailInput');
        const globalApiKey = 获取CF输入值('cfGlobalApiKeyInput');
        if (!email || !globalApiKey) {
          alert('请填写完整的邮箱认证信息（CF 邮箱 + Global API Key）');
          return false;
        }
      }
      return true;
    }

    async function 保存CF凭证() {
      if (!校验CF凭证()) return;
      const formData = new FormData();
      formData.append('authMethod', document.getElementById('cfAuthMethod').value);
      formData.append('accountId', document.getElementById('cfAccountIdInput').value.trim());
      formData.append('apiToken', 获取CF输入值('cfApiTokenInput'));
      formData.append('email', 获取CF输入值('cfEmailInput'));
      formData.append('globalApiKey', 获取CF输入值('cfGlobalApiKeyInput'));
      try {
        const res = await fetch('/set-cf-credentials', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('保存失败');
        alert('CF凭证已保存');
        subInfoEnabled = true;
        await 刷新用量();
      } catch (error) {
        alert('保存CF凭证失败：' + error.message);
      }
    }

    async function 刷新用量() {
      const statusElement = document.getElementById('subInfoStatus');
      if (!subInfoEnabled) {
        statusElement.textContent = '未配置 CF 凭证，填入令牌后自动开启请求统计';
        statusElement.className = 'proxy-status direct';
        return;
      }
      statusElement.textContent = '查询中...';
      try {
        const res = await fetch('/get-cf-usage');
        if (!res.ok) throw new Error('查询失败');
        const data = await res.json();
        if (data.success) {
          const percent = ((data.total / data.max) * 100).toFixed(1);
          statusElement.textContent = 'Pages: ' + data.pages + ' | Workers: ' + data.workers + ' | 总计: ' + data.total + '/' + data.max + ' (' + percent + '%)';
          statusElement.className = 'proxy-status success';
        } else {
          statusElement.textContent = '查询失败：' + (data.error || '请检查CF凭证');
          statusElement.className = 'proxy-status direct';
        }
      } catch (error) {
        statusElement.textContent = '查询失败：' + error.message;
        statusElement.className = 'proxy-status direct';
      }
    }

    // ====================== 订阅链接更新 ======================
    function updateSubLinks() {
      const tokenParam = subTokenEnabled && subToken ? '?token=' + subToken : '';
      const links = [
        { id: 'clashLink', base: 'https://${hostName}/${配置路径}/${atob('Y2xhc2g=')}' },
        { id: 'v2rayLink', base: 'https://${hostName}/${配置路径}/${atob('djJyYXluZw==')}' },
        { id: 'singboxLink', base: 'https://${hostName}/${配置路径}/${atob('c2luZ2JveA==')}' }
      ];
      links.forEach(link => {
        const el = document.getElementById(link.id);
        if (el) {
          el.href = link.base + tokenParam;
          el.textContent = link.base + tokenParam;
        }
      });
    }

    ${花瓣脚本}
  `;
}
