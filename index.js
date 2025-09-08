// 樱花代理面板 - 主入口文件

// 导入所需模块
import { checkLock, generateLoginRegisterPage, encryptPassword } from './utils/auth.js';
import { generateSubscriptionPage, generateKvNotBoundPage, generateCatConfig, generateUniversalConfig } from './utils/generate.js';
import { getOrInitializeUUID, loadNodesAndConfig, getConfig } from './utils/nodes.js';

// 环境变量配置
const PREFERRED_NODES = [];
const REVERSE_PROXY_ADDRESS = 'https://api.openai.com';
const SOCKS5_PROXY_ADDRESS = '';
const ENABLE_FORCE_PROXY = false;
const PROXY_TYPE = 'reverse'; // reverse 或 socks5

// 全局变量
let 代理状态 = '未初始化';
let 强制代理 = false;
let 代理类型 = 'reverse';
let 代理已启用 = false;

// 生成UUID函数
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}



// 验证Websocket连接
async function verifyWebsocketConnection(request, env, ctx) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // WS路径处理
  if (pathname.startsWith('/ws')) {
    return handleWebSocketConnection(request, env, ctx);
  }
  return null;
}

// 处理WebSocket连接
async function handleWebSocketConnection(request, env, ctx) {
  try {
    // 创建TCP连接到目标服务器
    const ipPort = request.headers.get('cf-connecting-ip') + ':' + request.headers.get('cf-connecting-port');
    let target = ipPort;
    
    // 优先使用节点列表中的节点
    if (PREFERRED_NODES.length > 0) {
      target = PREFERRED_NODES[Math.floor(Math.random() * PREFERRED_NODES.length)];
      if (target.includes('|')) {
        target = target.split('|')[0];
      }
    }
    
    // 尝试连接到目标服务器
    const [host, port] = target.split(':');
    const tcpSocket = await connectToTarget(host, port, request, env);
    
    // 创建WebSocket响应
    const { 1: webSocket, 0: response } = new WebSocketPair();
    
    // 处理WebSocket消息
    webSocket.accept();
    
    // 建立双向数据流
    const webSocketReadable = webSocket.readable;
    const webSocketWritable = webSocket.writable;
    
    // 处理数据流错误
    tcpSocket.readable.pipeTo(webSocketWritable).catch(err => {
      console.error('TCP to WebSocket pipe error:', err);
      try { webSocket.close(); } catch (e) {}
    });
    
    webSocketReadable.pipeTo(tcpSocket.writable).catch(err => {
      console.error('WebSocket to TCP pipe error:', err);
      try { tcpSocket.close(); } catch (e) {}
    });
    
    return response;
  } catch (error) {
    console.error('WebSocket连接失败:', error);
    return new Response('WebSocket连接失败', { status: 500 });
  }
}

// 连接到目标服务器
async function connectToTarget(host, port, request, env) {
  try {
    // 智能连接处理
    return await smartConnect(host, port, request, env);
  } catch (error) {
    console.error('连接目标服务器失败:', error);
    throw error;
  }
}

// 智能连接函数，处理直连/反代/SOCKS5代理
async function smartConnect(host, port, request, env) {
  try {
    // 直接连接到目标服务器
    const socket = await env.PROXYIP.connect(port, host);
    return socket;
  } catch (error) {
    console.error('直连失败，尝试其他连接方式:', error);
    throw error;
  }
}

// 处理表单数据
async function handleFormData(request) {
  try {
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('multipart/form-data')) {
      return await request.formData();
    } else if (contentType && contentType.includes('application/json')) {
      return await request.json();
    } else {
      const formData = new URLSearchParams(await request.text());
      const data = {};
      for (const [key, value] of formData) {
        data[key] = value;
      }
      return data;
    }
  } catch (error) {
    console.error('处理表单数据失败:', error);
    return {};
  }
}

// 验证密钥
async function verifyKey(env, key) {
  try {
    const savedKey = await env.KV数据库.get('auth_key');
    return savedKey === key;
  } catch (error) {
    console.error('验证密钥失败:', error);
    return false;
  }
}

// 解析请求头
function parseHeaders(headers) {
  const result = {};
  for (const [key, value] of headers) {
    result[key.toLowerCase()] = value;
  }
  return result;
}

// 获取Cookie
function getCookie(request, name) {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`(^|; )${name}=([^;]+)`));
  return match ? match[2] : null;
}

// 设置Cookie
function setCookie(name, value, options = {}) {
  let cookieString = `${name}=${value}`;
  if (options.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
  if (options.path) cookieString += `; Path=${options.path}`;
  if (options.httpOnly) cookieString += '; HttpOnly';
  if (options.secure) cookieString += '; Secure';
  if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;
  return cookieString;
}

// 创建响应
function createResponse(body, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  const headers = {
    ...defaultHeaders,
    ...options.headers
  };
  
  return new Response(body, {
    status: options.status || 200,
    headers
  });
}

// 主处理函数
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const hostName = url.hostname;
  
  // 初始化节点和配置
  ctx.waitUntil(loadNodesAndConfig(env, hostName, PREFERRED_NODES, hostName));
  
  // 验证是否有KV绑定
  try {
    await env.KV数据库.get('test');
  } catch (error) {
    console.error('KV数据库未绑定:', error);
    return createResponse(generateKvNotBoundPage('https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
  }
  
  // 处理WebSocket连接
  const wsResponse = await verifyWebsocketConnection(request, env, ctx);
  if (wsResponse) return wsResponse;
  
  // 处理API和页面路由
  switch (pathname) {
    case '/':
      return createResponse(generateLoginRegisterPage('登录', {}, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
    
    case '/login':
      return createResponse(generateLoginRegisterPage('登录', {}, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
    
    case '/register':
      return createResponse(generateLoginRegisterPage('注册', {}, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
    
    case '/login/submit':
      return handleLoginSubmit(request, env);
    
    case '/register/submit':
      return handleRegisterSubmit(request, env);
    
    case '/config':
      const uuid = await getOrInitializeUUID(env);
      return createResponse(generateSubscriptionPage(uuid, hostName, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
    
    case '/config/upload':
      return handleUploadIpFiles(request, env);
    
    case '/config/change-uuid':
      return handleChangeUUID(request, env);
    
    case '/config/logout':
      return handleLogout();
    
    case '/config/get-node-paths':
      return getNodePaths(request, env);
    
    case '/config/add-node-path':
      return addNodePath(request, env);
    
    case '/config/remove-node-path':
      return removeNodePath(request, env);
    
    case '/get-proxy-status':
      return getProxyStatus();
    
    case '/set-proxy-state':
      return setProxyState(request, env);
    
    case '/config/cat':
      const catUuid = url.searchParams.get('uuid') || await getOrInitializeUUID(env);
      const catConfig = await getConfig(env, 'cat', hostName, generateCatConfig);
      return new Response(catConfig, { headers: { 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename="cat-config.txt"' } });
    
    case '/config/universal':
      const universalUuid = url.searchParams.get('uuid') || await getOrInitializeUUID(env);
      const universalConfig = await getConfig(env, 'vmess', hostName, generateUniversalConfig);
      return new Response(universalConfig, { headers: { 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename="universal-config.txt"' } });
    
    case '/check-lock':
      const deviceId = request.headers.get('User-Agent') || 'unknown';
      const lockStatus = await checkLock(env, deviceId, 1800000); // 30分钟
      return new Response(JSON.stringify(lockStatus), { headers: { 'Content-Type': 'application/json' } });
    
    case '/reset-login-failures':
      const resetDeviceId = request.headers.get('User-Agent') || 'unknown';
      await env.KV数据库.delete(`lock_${resetDeviceId}`);
      await env.KV数据库.delete(`login_failures_${resetDeviceId}`);
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    
    default:
      // 默认代理处理逻辑
      return handleProxyRequest(request, env);
  }
}

// 处理登录提交
async function handleLoginSubmit(request, env) {
  try {
    const data = await handleFormData(request);
    const username = data.username;
    const password = data.password;
    const rememberMe = data.rememberMe === 'on' || data.rememberMe === 'true';
    
    // 验证用户
    const storedUser = await env.KV数据库.get(`user_${username}`);
    
    if (!storedUser) {
      return createResponse(generateLoginRegisterPage('登录', { 错误信息: '用户不存在' }, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
    }
    
    const userData = JSON.parse(storedUser);
    const hashedPassword = await encryptPassword(password);
    
    // 验证密码
    if (userData.password !== hashedPassword) {
      // 处理登录失败次数
      const deviceId = request.headers.get('User-Agent') || 'unknown';
      const failuresKey = `login_failures_${deviceId}`;
      const currentFailures = await env.KV数据库.get(failuresKey) || '0';
      const newFailures = parseInt(currentFailures) + 1;
      
      await env.KV数据库.put(failuresKey, newFailures.toString());
      
      // 如果失败次数过多，锁定账户
      if (newFailures >= 5) {
        const lockTime = Date.now() + 1800000; // 锁定30分钟
        await env.KV数据库.put(`lock_${deviceId}`, lockTime.toString());
        return createResponse(generateLoginRegisterPage('登录', { 锁定状态: true, 剩余时间: 1800 }, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
      }
      
      const remainingAttempts = 5 - newFailures;
      return createResponse(generateLoginRegisterPage('登录', { 输错密码: true, 剩余次数: remainingAttempts }, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
    }
    
    // 登录成功，清除失败记录
    const deviceId = request.headers.get('User-Agent') || 'unknown';
    await env.KV数据库.delete(`login_failures_${deviceId}`);
    
    // 设置会话
    const sessionId = generateUUID();
    await env.KV数据库.put(`session_${sessionId}`, username, { expirationTtl: rememberMe ? 2592000 : 86400 }); // 30天或24小时
    
    // 生成UUID
    const uuid = await getOrInitializeUUID(env);
    
    // 重定向到配置页面
    const response = Response.redirect('/config', 302);
    response.headers.append('Set-Cookie', setCookie('session', sessionId, { path: '/', secure: true, sameSite: 'Lax', maxAge: rememberMe ? 2592000 : 86400 }));
    return response;
  } catch (error) {
    console.error('登录处理失败:', error);
    return createResponse(generateLoginRegisterPage('登录', { 错误信息: '登录过程中出现错误，请重试' }, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
  }
}

// 处理注册提交
async function handleRegisterSubmit(request, env) {
  try {
    const data = await handleFormData(request);
    const username = data.username;
    const password = data.password;
    const confirmPassword = data.confirm;
    
    // 验证用户名格式
    if (!/^[a-zA-Z0-9]{4,20}$/.test(username)) {
      return createResponse(generateLoginRegisterPage('注册', { 错误信息: '用户名必须为4-20位字母数字' }, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
    }
    
    // 验证密码长度
    if (password.length < 6) {
      return createResponse(generateLoginRegisterPage('注册', { 错误信息: '密码长度至少为6位' }, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
    }
    
    // 验证两次密码是否一致
    if (password !== confirmPassword) {
      return createResponse(generateLoginRegisterPage('注册', { 错误信息: '两次输入的密码不一致' }, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
    }
    
    // 检查用户是否已存在
    const existingUser = await env.KV数据库.get(`user_${username}`);
    if (existingUser) {
      return createResponse(generateLoginRegisterPage('注册', { 错误信息: '用户名已存在' }, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
    }
    
    // 加密密码
    const hashedPassword = await encryptPassword(password);
    
    // 存储用户信息
    await env.KV数据库.put(`user_${username}`, JSON.stringify({ username, password: hashedPassword, createdAt: Date.now() }));
    
    // 注册成功，自动生成UUID
    await getOrInitializeUUID(env);
    
    // 显示注册成功页面
    return createResponse(generateLoginRegisterPage('登录', { 注册成功: '注册成功，请登录' }, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
  } catch (error) {
    console.error('注册处理失败:', error);
    return createResponse(generateLoginRegisterPage('注册', { 错误信息: '注册过程中出现错误，请重试' }, 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura', 'https://api.dicebear.com/7.x/croodles/svg?seed=sakura-dark'));
  }
}

// 处理节点文件上传
async function handleUploadIpFiles(request, env) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('ipFiles');
    
    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: '请选择要上传的文件' }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
    }
    
    let allIps = [];
    
    // 处理每个上传的文件
    for (const file of files) {
      const fileContent = await file.text();
      const ips = fileContent.split('\n').map(line => line.trim()).filter(Boolean);
      allIps = [...allIps, ...ips];
    }
    
    if (allIps.length === 0) {
      return new Response(JSON.stringify({ error: '上传的文件中未找到有效的IP地址' }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
    }
    
    // 去重并保存
    const uniqueIps = [...new Set(allIps)];
    await env.KV数据库.put('manual_preferred_ips', JSON.stringify(uniqueIps));
    
    // 更新节点版本
    const newVersion = String(Date.now());
    await env.KV数据库.put('ip_preferred_ips_version', newVersion);
    
    return new Response(JSON.stringify({ message: `成功上传 ${uniqueIps.length} 个节点` }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('上传IP文件失败:', error);
    return new Response(JSON.stringify({ error: '上传失败，请重试' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
}

// 处理UUID更换
async function handleChangeUUID(request, env) {
  try {
    const newUuid = generateUUID();
    await env.KV数据库.put('current_uuid', newUuid);
    
    // 强制更新配置缓存
    await env.KV数据库.delete('config_cat');
    await env.KV数据库.delete('config_vmess');
    
    return new Response(JSON.stringify({ uuid: newUuid }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('更换UUID失败:', error);
    return new Response(JSON.stringify({ error: '更换失败，请重试' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
}

// 处理退出登录
function handleLogout() {
  const response = Response.redirect('/', 302);
  response.headers.append('Set-Cookie', setCookie('session', '', { path: '/', maxAge: 0 }));
  return response;
}

// 获取节点路径列表
async function getNodePaths(request, env) {
  try {
    const nodePathsCache = await env.KV数据库.get('node_file_paths');
    const nodePaths = nodePathsCache ? JSON.parse(nodePathsCache) : ['https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt', 'https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt'];
    return new Response(JSON.stringify({ paths: nodePaths }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('获取节点路径失败:', error);
    return new Response(JSON.stringify({ error: '获取失败，请重试' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
}

// 添加节点路径
async function addNodePath(request, env) {
  try {
    const data = await request.json();
    const newPath = data.path.trim();
    
    if (!newPath) {
      return new Response(JSON.stringify({ error: '请输入有效的路径' }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
    }
    
    // 验证URL格式
    try {
      new URL(newPath);
    } catch (error) {
      return new Response(JSON.stringify({ error: '请输入有效的URL格式' }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
    }
    
    // 获取现有路径列表
    const nodePathsCache = await env.KV数据库.get('node_file_paths');
    const nodePaths = nodePathsCache ? JSON.parse(nodePathsCache) : [];
    
    // 检查是否已存在
    if (nodePaths.includes(newPath)) {
      return new Response(JSON.stringify({ error: '该路径已存在' }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
    }
    
    // 添加新路径
    nodePaths.push(newPath);
    await env.KV数据库.put('node_file_paths', JSON.stringify(nodePaths));
    
    // 强制更新节点
    const newVersion = String(Date.now());
    await env.KV数据库.put('ip_preferred_ips_version', newVersion);
    
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('添加节点路径失败:', error);
    return new Response(JSON.stringify({ error: '添加失败，请重试' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
}

// 移除节点路径
async function removeNodePath(request, env) {
  try {
    const data = await request.json();
    const index = parseInt(data.index);
    
    // 获取现有路径列表
    const nodePathsCache = await env.KV数据库.get('node_file_paths');
    const nodePaths = nodePathsCache ? JSON.parse(nodePathsCache) : [];
    
    // 检查索引是否有效
    if (isNaN(index) || index < 0 || index >= nodePaths.length) {
      return new Response(JSON.stringify({ error: '无效的索引' }), { headers: { 'Content-Type': 'application/json' }, status: 400 });
    }
    
    // 移除路径
    nodePaths.splice(index, 1);
    await env.KV数据库.put('node_file_paths', JSON.stringify(nodePaths));
    
    // 强制更新节点
    const newVersion = String(Date.now());
    await env.KV数据库.put('ip_preferred_ips_version', newVersion);
    
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('移除节点路径失败:', error);
    return new Response(JSON.stringify({ error: '移除失败，请重试' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
}

// 获取代理状态
function getProxyStatus() {
  return new Response(JSON.stringify({
    status: 代理已启用 ? '已启用' : '已禁用',
    forceProxy: 强制代理,
    proxyType: 代理类型
  }), { headers: { 'Content-Type': 'application/json' } });
}

// 设置代理状态
async function setProxyState(request, env) {
  try {
    const formData = await request.formData();
    const enabled = formData.get('proxyEnabled') === 'true';
    const force = formData.get('forceProxy') === 'true';
    const type = formData.get('proxyType') || 'reverse';
    
    // 更新全局代理状态
    代理已启用 = enabled;
    强制代理 = force;
    代理类型 = type;
    代理状态 = enabled ? '已启用' : '已禁用';
    
    // 保存代理设置到KV
    await env.KV数据库.put('proxy_settings', JSON.stringify({
      enabled,
      force,
      type,
      updatedAt: Date.now()
    }));
    
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('设置代理状态失败:', error);
    return new Response(JSON.stringify({ error: '设置失败，请重试' }), { headers: { 'Content-Type': 'application/json' }, status: 500 });
  }
}

// 处理代理请求
async function handleProxyRequest(request, env) {
  try {
    // 根据代理设置决定是否代理请求
    if (!代理已启用 && !强制代理) {
      // 不代理，返回404
      return new Response('Not Found', { status: 404 });
    }
    
    // 获取原始请求信息
    const url = new URL(request.url);
    const headers = parseHeaders(request.headers);
    const method = request.method;
    
    // 构建代理目标URL
    let targetUrl = url.pathname === '/' ? REVERSE_PROXY_ADDRESS : `${REVERSE_PROXY_ADDRESS}${url.pathname}`;
    if (url.search) {
      targetUrl += url.search;
    }
    
    // 构建代理请求
    const proxyRequest = new Request(targetUrl, {
      method: method,
      headers: headers,
      body: method === 'GET' || method === 'HEAD' ? null : request.body,
      redirect: 'follow'
    });
    
    // 发送代理请求
    const response = await fetch(proxyRequest);
    
    // 复制响应
    const clonedResponse = new Response(response.body, response);
    
    // 添加CORS头部
    clonedResponse.headers.set('Access-Control-Allow-Origin', '*');
    clonedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    clonedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return clonedResponse;
  } catch (error) {
    console.error('代理请求失败:', error);
    return new Response('代理请求失败', { status: 500 });
  }
}

// 注册fetch事件处理器
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event.env, event.ctx));
});

// 注册WebSocket连接事件处理器
addEventListener('websocket', event => {
  console.log('WebSocket连接已建立');
  event.accept();
});