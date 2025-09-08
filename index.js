import { createHTMLResponse, createRedirectResponse, createJSONResponse } from './utils/response.js';
import { checkLock, generateLoginRegisterPage, encryptPassword } from './utils/auth.js';
import { loadNodesAndConfig, getConfig, getOrInitializeUUID } from './utils/nodes.js';
import { generateSubscriptionPage, generateKvNotBoundPage, generateCatConfig, generateUniversalConfig } from './utils/generate.js';
import { handleWebSocketUpgrade, handleSocks5Connection } from './utils/websocket.js';
import { mockKvInstance } from './utils/mock-kv.js';

// 基础配置
const CONFIG_PATH = "config";
let PREFERRED_NODES = [];
let PROXY_ADDRESS = 'ts.hpc.tw';
let SOCKS5_ACCOUNT = '';
let NODE_NAME = '🌸樱花';
let FAKE_DOMAIN = 'lkssite.vip';
let MAX_FAILURES = 5;
let LOCK_TIME = 5 * 60 * 1000;
let LIGHT_BG_IMAGE = 'https://i.meee.com.tw/el91luR.png';
let DARK_BG_IMAGE = 'https://i.meee.com.tw/QPWx8nX.png';

export default {
  async fetch(request, env) {
    try {
      // 从环境变量读取配置
      PROXY_ADDRESS = env.PROXYIP || PROXY_ADDRESS;
      SOCKS5_ACCOUNT = env.SOCKS5 || SOCKS5_ACCOUNT;
      const isDevelopmentMode = env.DEVELOPMENT_MODE === 'true';
      
      // 检查是否有KV数据库，如果没有且处于开发模式，则使用模拟KV
      if (!env.KV数据库) {
        if (isDevelopmentMode) {
          // 开发模式下使用模拟KV数据库
          env.KV数据库 = mockKvInstance;
          console.log('开发模式：使用模拟KV数据库');
        } else {
          return createHTMLResponse(generateKvNotBoundPage(LIGHT_BG_IMAGE, DARK_BG_IMAGE));
        }
      }

      const upgradeHeader = request.headers.get('Upgrade');
      const url = new URL(request.url);
      const hostName = request.headers.get('Host');
      const UA = request.headers.get('User-Agent') || 'unknown';
      const IP = request.headers.get('CF-Connecting-IP') || 'unknown';
      const deviceId = `${UA}_${IP}`;
      let formData;

      // WebSocket 处理
      if (upgradeHeader && upgradeHeader === 'websocket') {
        await loadNodesAndConfig(env, hostName, PREFERRED_NODES, NODE_NAME);
        return await handleWebSocketUpgrade(request, env, hostName, PREFERRED_NODES);
      }

      // 表单数据处理
      if (url.pathname === '/login/submit' || url.pathname === '/register/submit') {
        const contentType = request.headers.get('Content-Type') || '';
        if (!contentType.includes('application/x-www-form-urlencoded') && !contentType.includes('multipart/form-data')) {
          console.log(`无效请求: UA=${UA}, IP=${IP}, Path=${url.pathname}, Headers=${JSON.stringify([...request.headers])}`);
          return createHTMLResponse(generateLoginRegisterPage(url.pathname === '/login/submit' ? '登录' : '注册', {
            错误信息: '请通过正常表单提交'
          }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 400);
        }

        try {
          formData = await request.formData();
        } catch (error) {
          return createHTMLResponse(generateLoginRegisterPage(url.pathname === '/login/submit' ? '登录' : '注册', {
            错误信息: '提交数据格式错误，请重试'
          }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 400);
        }
      }

      // 注册处理
      if (url.pathname === '/register/submit') {
        const username = formData.get('username');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm');

        if (!username || !password || password !== confirmPassword) {
          return createHTMLResponse(generateLoginRegisterPage('注册', {
            错误信息: password !== confirmPassword ? '两次密码不一致' : '请填写完整信息'
          }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 400);
        }

        const existingUser = await env.KV数据库.get('stored_credentials');
        if (existingUser) {
          return createRedirectResponse('/login');
        }

        const encryptedPassword = await encryptPassword(password);
        await env.KV数据库.put('stored_credentials', JSON.stringify({
          username, password: encryptedPassword
        }));

        const newToken = Math.random().toString(36).substring(2);
        await env.KV数据库.put('current_token', newToken, { expirationTtl: 300 });
        return createRedirectResponse(`/${CONFIG_PATH}`, {
          'Set-Cookie': `token=${newToken}; Path=/; HttpOnly; SameSite=Strict`
        });
      }

      // 登录处理
      if (url.pathname === '/login/submit') {
        const lockStatus = await checkLock(env, deviceId, LOCK_TIME);
        if (lockStatus.被锁定) {
          return createHTMLResponse(generateLoginRegisterPage('登录', {
            锁定状态: true,
            剩余时间: lockStatus.剩余时间
          }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 403);
        }

        const storedCredentials = await env.KV数据库.get('stored_credentials');
        if (!storedCredentials) {
          return createRedirectResponse('/register');
        }

        const inputUsername = formData.get('username');
        const inputPassword = formData.get('password');

        const credentialsObj = JSON.parse(storedCredentials || '{}');
        const passwordMatch = (await encryptPassword(inputPassword)) === credentialsObj.password;
        if (inputUsername === credentialsObj.username && passwordMatch) {
          const newToken = Math.random().toString(36).substring(2);
          await env.KV数据库.put('current_token', newToken, { expirationTtl: 300 });
          await env.KV数据库.put(`fail_${deviceId}`, '0');
          return createRedirectResponse(`/${CONFIG_PATH}`, {
            'Set-Cookie': `token=${newToken}; Path=/; HttpOnly; SameSite=Strict`
          });
        }

        let failureCount = Number(await env.KV数据库.get(`fail_${deviceId}`) || 0) + 1;
        await env.KV数据库.put(`fail_${deviceId}`, String(failureCount));

        if (failureCount >= MAX_FAILURES) {
          await env.KV数据库.put(`lock_${deviceId}`, String(Date.now() + LOCK_TIME), { expirationTtl: 300 });
          const newLockStatus = await checkLock(env, deviceId, LOCK_TIME);
          return createHTMLResponse(generateLoginRegisterPage('登录', {
            锁定状态: true,
            剩余时间: newLockStatus.剩余时间
          }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 403);
        }

        return createHTMLResponse(generateLoginRegisterPage('登录', {
          输错密码: true,
          剩余次数: MAX_FAILURES - failureCount
        }, LIGHT_BG_IMAGE, DARK_BG_IMAGE), 401);
      }

      // 检查是否已注册
      const isRegistered = await env.KV数据库.get('stored_credentials');
      if (!isRegistered && url.pathname !== '/register') {
        return createHTMLResponse(generateLoginRegisterPage('注册', {}, LIGHT_BG_IMAGE, DARK_BG_IMAGE));
      }

      // 路由处理
      switch (url.pathname) {
        case '/login':
          const storedCredentials = await env.KV数据库.get('stored_credentials');
          if (!storedCredentials) {
            return createRedirectResponse('/register');
          }

          const lockStatus = await checkLock(env, deviceId, LOCK_TIME);
          if (lockStatus.被锁定) {
            return createHTMLResponse(generateLoginRegisterPage('登录', { 锁定状态: true, 剩余时间: lockStatus.剩余时间 }, LIGHT_BG_IMAGE, DARK_BG_IMAGE));
          }
          if (request.headers.get('Cookie')?.split('=')[1] === await env.KV数据库.get('current_token')) {
            return createRedirectResponse(`/${CONFIG_PATH}`);
          }
          const failureCount = Number(await env.KV数据库.get(`fail_${deviceId}`) || 0);
          return createHTMLResponse(generateLoginRegisterPage('登录', { 输错密码: failureCount > 0, 剩余次数: MAX_FAILURES - failureCount }, LIGHT_BG_IMAGE, DARK_BG_IMAGE));

        case '/reset-login-failures':
          await env.KV数据库.put(`fail_${deviceId}`, '0');
          await env.KV数据库.delete(`lock_${deviceId}`);
          return new Response(null, { status: 200 });

        case '/check-lock':
          const lockCheck = await checkLock(env, deviceId, LOCK_TIME);
          return createJSONResponse({
            locked: lockCheck.被锁定,
            remainingTime: lockCheck.剩余时间
          });

        case `/${CONFIG_PATH}`:
          const token = request.headers.get('Cookie')?.split('=')[1];
          const validToken = await env.KV数据库.get('current_token');
          if (!token || token !== validToken) return createRedirectResponse('/login');
          const uuid = await getOrInitializeUUID(env);
          return createHTMLResponse(generateSubscriptionPage(CONFIG_PATH, hostName, uuid, LIGHT_BG_IMAGE, DARK_BG_IMAGE));

        case `/${CONFIG_PATH}/logout`:
          await env.KV数据库.delete('current_token');
          return createRedirectResponse('/login', { 'Set-Cookie': 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict' });

        case `/${CONFIG_PATH}/` + atob('Y2xhc2g='):
          await loadNodesAndConfig(env, hostName, PREFERRED_NODES, NODE_NAME);
          const catConfig = await getConfig(env, atob('Y2xhc2g='), hostName, generateCatConfig);
          return new Response(catConfig, { status: 200, headers: { "Content-Type": "text/plain;charset=utf-8" } });

        case `/${CONFIG_PATH}/` + atob('djJyYXluZw=='):
          await loadNodesAndConfig(env, hostName, PREFERRED_NODES, NODE_NAME);
          const universalConfig = await getConfig(env, atob('djJyYXk='), hostName, generateUniversalConfig);
          return new Response(universalConfig, { status: 200, headers: { "Content-Type": "text/plain;charset=utf-8" } });

        case `/${CONFIG_PATH}/upload`:
          const uploadToken = request.headers.get('Cookie')?.split('=')[1];
          const validUploadToken = await env.KV数据库.get('current_token');
          if (!uploadToken || uploadToken !== validUploadToken) {
            return createJSONResponse({ error: '未登录或Token无效，请重新登录' }, 401);
          }
          formData = await request.formData();
          const ipFiles = formData.getAll('ipFiles');
          if (!ipFiles || ipFiles.length === 0) {
            return createJSONResponse({ error: '未选择任何文件' }, 400);
          }
          let allIpList = [];
          try {
            for (const ipFile of ipFiles) {
              if (!ipFile || !ipFile.text) throw new Error(`文件 ${ipFile.name} 无效`);
              const ipText = await ipFile.text();
              const ipList = ipText.split('\n').map(line => line.trim()).filter(Boolean);
              if (ipList.length === 0) console.warn(`文件 ${ipFile.name} 内容为空`);
              allIpList = allIpList.concat(ipList);
            }
            if (allIpList.length === 0) {
              return createJSONResponse({ error: '所有上传文件内容为空' }, 400);
            }
            const uniqueIpList = [...new Set(allIpList)];

            const currentManualNodes = await env.KV数据库.get('manual_preferred_ips');
            const currentNodeList = currentManualNodes ? JSON.parse(currentManualNodes) : [];
            const isDuplicateUpload = JSON.stringify(currentNodeList.sort()) === JSON.stringify(uniqueIpList.sort());
            if (isDuplicateUpload) {
              return createJSONResponse({ message: '上传内容与现有节点相同，无需更新' }, 200);
            }

            await env.KV数据库.put('manual_preferred_ips', JSON.stringify(uniqueIpList));
            const newVersion = String(Date.now());
            await env.KV数据库.put('ip_preferred_ips_version', newVersion);
            await env.KV数据库.put('config_' + atob('Y2xhc2g='), await generateCatConfig(env, hostName, PREFERRED_NODES, NODE_NAME));
            await env.KV数据库.put('config_' + atob('Y2xhc2g=') + '_version', newVersion);
            await env.KV数据库.put('config_' + atob('djJyYXk='), await generateUniversalConfig(env, hostName, PREFERRED_NODES, NODE_NAME));
            await env.KV数据库.put('config_' + atob('djJyYXk=') + '_version', newVersion);
            return createJSONResponse({ message: '上传成功，即将跳转' }, 200, { 'Location': `/${CONFIG_PATH}` });
          } catch (error) {
            console.error(`上传处理失败: ${error.message}`);
            return createJSONResponse({ error: `上传处理失败: ${error.message}` }, 500);
          }

        case `/${CONFIG_PATH}/change-uuid`:
          const changeToken = request.headers.get('Cookie')?.split('=')[1];
          const validChangeToken = await env.KV数据库.get('current_token');
          if (!changeToken || changeToken !== validChangeToken) {
            return createJSONResponse({ error: '未登录或Token无效' }, 401);
          }
          const newUUID = generateUUID();
          await env.KV数据库.put('current_uuid', newUUID);
          await env.KV数据库.put('config_' + atob('Y2xhc2g='), await generateCatConfig(env, hostName, PREFERRED_NODES, NODE_NAME));
          await env.KV数据库.put('config_' + atob('djJyYXk='), await generateUniversalConfig(env, hostName, PREFERRED_NODES, NODE_NAME));
          const newVersion = String(Date.now());
          await env.KV数据库.put('config_' + atob('Y2xhc2g=') + '_version', newVersion);
          await env.KV数据库.put('config_' + atob('djJyYXk=') + '_version', newVersion);
          return createJSONResponse({ uuid: newUUID }, 200);

        case `/${CONFIG_PATH}/add-node-path`:
          const addToken = request.headers.get('Cookie')?.split('=')[1];
          const validAddToken = await env.KV数据库.get('current_token');
          if (!addToken || addToken !== validAddToken) {
            return createJSONResponse({ error: '未登录或Token无效' }, 401);
          }
          const addData = await request.json();
          const newPath = addData.path;
          if (!newPath || !newPath.match(/^https?:\/\//)) {
            return createJSONResponse({ error: '无效的URL格式' }, 400);
          }
          let currentPaths = await env.KV数据库.get('node_file_paths');
          currentPaths = currentPaths ? JSON.parse(currentPaths) : [];
          if (currentPaths.includes(newPath)) {
            return createJSONResponse({ error: '该路径已存在' }, 400);
          }
          currentPaths.push(newPath);
          await env.KV数据库.put('node_file_paths', JSON.stringify(currentPaths));
          await loadNodesAndConfig(env, hostName, PREFERRED_NODES, NODE_NAME);
          return createJSONResponse({ success: true }, 200);

        case `/${CONFIG_PATH}/remove-node-path`:
          const removeToken = request.headers.get('Cookie')?.split('=')[1];
          const validRemoveToken = await env.KV数据库.get('current_token');
          if (!removeToken || removeToken !== validRemoveToken) {
            return createJSONResponse({ error: '未登录或Token无效' }, 401);
          }
          const removeData = await request.json();
          const index = removeData.index;
          let paths = await env.KV数据库.get('node_file_paths');
          paths = paths ? JSON.parse(paths) : [];
          if (index < 0 || index >= paths.length) {
            return createJSONResponse({ error: '无效的索引' }, 400);
          }
          paths.splice(index, 1);
          await env.KV数据库.put('node_file_paths', JSON.stringify(paths));
          await loadNodesAndConfig(env, hostName, PREFERRED_NODES, NODE_NAME);
          return createJSONResponse({ success: true }, 200);

        case `/${CONFIG_PATH}/get-node-paths`:
          const getToken = request.headers.get('Cookie')?.split('=')[1];
          const validGetToken = await env.KV数据库.get('current_token');
          if (!getToken || getToken !== validGetToken) {
            return createJSONResponse({ error: '未登录或Token无效' }, 401);
          }
          let nodePaths = await env.KV数据库.get('node_file_paths');
          nodePaths = nodePaths ? JSON.parse(nodePaths) : ['https://v2.i-sweet.us.kg/ips.txt', 'https://v2.i-sweet.us.kg/url.txt'];
          return createJSONResponse({ paths: nodePaths }, 200);

        case '/set-proxy-state':
          formData = await request.formData();
          const proxyEnabled = formData.get('proxyEnabled');
          const proxyType = formData.get('proxyType');
          const forceProxy = formData.get('forceProxy');
          await env.KV数据库.put('proxyEnabled', proxyEnabled);
          await env.KV数据库.put('proxyType', proxyType);
          await env.KV数据库.put('forceProxy', forceProxy);
          return new Response(null, { status: 200 });

        case '/get-proxy-status':
          const currentProxyEnabled = await env.KV数据库.get('proxyEnabled') === 'true';
          const currentProxyType = await env.KV数据库.get('proxyType') || 'reverse';
          const currentForceProxy = await env.KV数据库.get('forceProxy') === 'true';
          const proxyAddress = env.PROXYIP || 'ts.hpc.tw';
          const socks5Account = env.SOCKS5 || '';
          let status = '直连';
          if (currentProxyEnabled) {
            if (currentForceProxy) {
              status = currentProxyType === 'reverse' && proxyAddress ? '强制反代' : '强制SOCKS5';
            } else if (currentProxyType === 'reverse' && proxyAddress) {
              status = '动态反代';
            } else if (currentProxyType === 'socks5' && socks5Account) {
              status = '动态SOCKS5';
            }
          }
          return createJSONResponse({ status });

        default:
          url.hostname = FAKE_DOMAIN;
          url.protocol = 'https:';
          return fetch(new Request(url, request));
      }
    } catch (error) {
      console.error(`全局错误: ${error.message}`);
      return createJSONResponse({ error: `服务器内部错误: ${error.message}` }, 500);
    }
  }
};

// 辅助函数
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}