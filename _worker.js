import { connect } from 'cloudflare:sockets';

// 全局变量
let 订阅路径 = "config";
let 开门锁匙 = uuidv4(); // 随机生成UUID
let 优选TXT路径 = []; // 动态加载
let 优选节点 = [];
let 启用反代 = false; // 默认关闭，通过UI切换
let 反代地址 = 'ts.hpc.tw';
let 启用SOCKS5 = false; // 默认关闭，通过UI切换
let 启用全局SOCKS5 = false;
let SOCKS5账号 = '';
let 节点名称 = '天书';
let 伪装域名 = 'lkssite.vip';
let 最大失败次数 = 5;
let 锁定时间 = 5 * 60 * 1000;
let 小猫 = 'cla';
let 咪 = 'sh';
let 符号 = '://';
let 歪啦 = 'vl';
let 伊埃斯 = 'ess';
let 歪兔 = 'v2';
let 蕊蒽 = 'rayN';
let 背景壁纸 = 'https://raw.githubusercontent.com/Alien-Et/ips/refs/heads/main/image/night.jpg';

// 简单的UUID v4生成函数
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 创建响应函数
function 创建HTML响应(内容, 状态码 = 200) {
  return new Response(内容, {
    status: 状态码,
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
    }
  });
}

function 创建重定向响应(路径, 额外头 = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": 路径,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...额外头
    }
  });
}

function 创建JSON响应(数据, 状态码 = 200, 额外头 = {}) {
  return new Response(JSON.stringify(数据), {
    status: 状态码,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...额外头
    }
  });
}

// 加载节点和配置
async function 加载节点和配置(env, hostName) {
  try {
    const txtPaths = await env.LOGIN_STATE.get('txt_paths');
    优选TXT路径 = txtPaths ? JSON.parse(txtPaths) : [];
    const 手动节点缓存 = await env.LOGIN_STATE.get('manual_preferred_ips');
    let 手动节点列表 = [];
    if (手动节点缓存) {
      手动节点列表 = JSON.parse(手动节点缓存).map(line => line.trim()).filter(Boolean);
    }

    const 响应列表 = await Promise.all(
      优选TXT路径.map(async (路径) => {
        try {
          const 响应 = await fetch(路径);
          if (!响应.ok) throw new Error(`请求 ${路径} 失败，状态码: ${响应.status}`);
          const 文本 = await 响应.text();
          return 文本.split('\n').map(line => line.trim()).filter(Boolean);
        } catch (错误) {
          console.error(`拉取 ${路径} 失败: ${错误.message}`);
          return [];
        }
      })
    );

    const 域名节点列表 = [...new Set(响应列表.flat())];
    const 合并节点列表 = [...new Set([...手动节点列表, ...域名节点列表])];
    const 缓存节点 = await env.LOGIN_STATE.get('ip_preferred_ips');
    const 当前节点列表 = 缓存节点 ? JSON.parse(缓存节点) : [];
    const 列表相同 = JSON.stringify(合并节点列表) === JSON.stringify(当前节点列表);

    if (合并节点列表.length > 0) {
      优选节点 = 合并节点列表;
      if (!列表相同) {
        const 新版本 = String(Date.now());
        await env.LOGIN_STATE.put('ip_preferred_ips', JSON.stringify(合并节点列表), { expirationTtl: 86400 });
        await env.LOGIN_STATE.put('ip_preferred_ips_version', 新版本);
        await env.LOGIN_STATE.put('config_clash', 生成猫咪配置(hostName), { expirationTtl: 86400 });
        await env.LOGIN_STATE.put('config_clash_version', 新版本);
        await env.LOGIN_STATE.put('config_v2ray', 生成备用配置(hostName), { expirationTtl: 86400 });
        await env.LOGIN_STATE.put('config_v2ray_version', 新版本);
      }
    } else {
      优选节点 = 当前节点列表.length > 0 ? 当前节点列表 : [`${hostName}:443`];
    }
  } catch (错误) {
    const 缓存节点 = await env.LOGIN_STATE.get('ip_preferred_ips');
    优选节点 = 缓存节点 ? JSON.parse(缓存节点) : [`${hostName}:443`];
    await env.LOGIN_STATE.put('ip_error_log', JSON.stringify({ time: Date.now(), error: '所有路径拉取失败或手动上传为空' }), { expirationTtl: 86400 });
  }
}

async function 获取配置(env, 类型, hostName) {
  const 缓存键 = 类型 === 'clash' ? 'config_clash' : 'config_v2ray';
  const 版本键 = `${缓存键}_version`;
  const 缓存配置 = await env.LOGIN_STATE.get(缓存键);
  const 配置版本 = await env.LOGIN_STATE.get(版本键) || '0';
  const 节点版本 = await env.LOGIN_STATE.get('ip_preferred_ips_version') || '0';

  if (缓存配置 && 配置版本 === 节点版本) {
    return 缓存配置;
  }

  const 新配置 = 类型 === 'clash' ? 生成猫咪配置(hostName) : 生成备用配置(hostName);
  await env.LOGIN_STATE.put(缓存键, 新配置, { expirationTtl: 86400 });
  await env.LOGIN_STATE.put(版本键, 节点版本);
  return 新配置;
}

async function 检查锁定(env, 设备标识) {
  const 锁定时间戳 = await env.LOGIN_STATE.get(`lock_${设备标识}`);
  const 当前时间 = Date.now();
  const 被锁定 = 锁定时间戳 && 当前时间 < Number(锁定时间戳);
  return {
    被锁定,
    剩余时间: 被锁定 ? Math.ceil((Number(锁定时间戳) - 当前时间) / 1000) : 0
  };
}

// 主处理逻辑
export default {
  async fetch(请求, env) {
    try {
      if (!env.LOGIN_STATE) {
        return 创建HTML响应(生成KV未绑定提示页面());
      }

      const 管理员账号 = await env.LOGIN_STATE.get('admin_username');
      if (!管理员账号) {
        return 创建HTML响应(生成注册页面());
      }

      const 请求头 = 请求.headers.get('Upgrade');
      const url = new URL(请求.url);
      const hostName = 请求.headers.get('Host');
      const UA = 请求.headers.get('User-Agent') || 'unknown';
      const IP = 请求.headers.get('CF-Connecting-IP') || 'unknown';
      const 设备标识 = `${UA}_${IP}`;
      let formData;

      if (!请求头 || 请求头 !== 'websocket') {
        switch (url.pathname) {
          case '/register/submit':
            formData = await 请求.formData();
            const 新账号 = formData.get('username');
            const 新密码 = formData.get('password');
            await env.LOGIN_STATE.put('admin_username', 新账号);
            await env.LOGIN_STATE.put('admin_password', 新密码);
            return 创建重定向响应('/login');
          case '/settings':
            const Token = 请求.headers.get('Cookie')?.split('=')[1];
            const 有效Token = await env.LOGIN_STATE.get('current_token');
            if (!Token || Token !== 有效Token) return 创建重定向响应('/login');
            return 创建HTML响应(生成设置页面(hostName));
          case '/settings/update':
            const 设置Token = 请求.headers.get('Cookie')?.split('=')[1];
            const 有效设置Token = await env.LOGIN_STATE.get('current_token');
            if (!设置Token || 设置Token !== 有效设置Token) return 创建JSON响应({ error: '未登录' }, 401);
            formData = await 请求.formData();
            启用反代 = formData.get('proxy') === 'on';
            启用SOCKS5 = formData.get('socks5') === 'on';
            const 新TXT路径 = formData.get('txtPaths')?.split('\n').map(line => line.trim()).filter(Boolean) || [];
            await env.LOGIN_STATE.put('txt_paths', JSON.stringify(新TXT路径));
            优选TXT路径 = 新TXT路径;
            return 创建JSON响应({ message: '设置已更新' }, 200);
          case '/reset-login-failures':
            await env.LOGIN_STATE.put(`fail_${设备标识}`, '0');
            await env.LOGIN_STATE.delete(`lock_${设备标识}`);
            return new Response(null, { status: 200 });
          case `/${订阅路径}`:
            const SubToken = 请求.headers.get('Cookie')?.split('=')[1];
            const 有效SubToken = await env.LOGIN_STATE.get('current_token');
            if (!SubToken || SubToken !== 有效SubToken) return 创建重定向响应('/login');
            return 创建HTML响应(生成订阅页面(订阅路径, hostName));
          case '/login':
            const 锁定状态 = await 检查锁定(env, 设备标识);
            if (锁定状态.被锁定) return 创建HTML响应(生成登录界面(true, 锁定状态.剩余时间));
            if (请求.headers.get('Cookie')?.split('=')[1] === await env.LOGIN_STATE.get('current_token')) {
              return 创建重定向响应(`/${订阅路径}`);
            }
            const 失败次数 = Number(await env.LOGIN_STATE.get(`fail_${设备标识}`) || 0);
            return 创建HTML响应(生成登录界面(false, 0, 失败次数 > 0, 最大失败次数 - 失败次数));
          case '/login/submit':
            const 锁定 = await 检查锁定(env, 设备标识);
            if (锁定.被锁定) return 创建重定向响应('/login');
            formData = await 请求.formData();
            const 提供的账号 = formData.get('username');
            const 提供的密码 = formData.get('password');
            const 存储账号 = await env.LOGIN_STATE.get('admin_username');
            const 存储密码 = await env.LOGIN_STATE.get('admin_password');
            if (提供的账号 === 存储账号 && 提供的密码 === 存储密码) {
              const 新Token = Math.random().toString(36).substring(2);
              await env.LOGIN_STATE.put('current_token', 新Token, { expirationTtl: 300 });
              await env.LOGIN_STATE.put(`fail_${设备标识}`, '0');
              return 创建重定向响应(`/${订阅路径}`, { 'Set-Cookie': `token=${新Token}; Path=/; HttpOnly; SameSite=Strict` });
            } else {
              let 失败次数 = Number(await env.LOGIN_STATE.get(`fail_${设备标识}`) || 0) + 1;
              await env.LOGIN_STATE.put(`fail_${设备标识}`, String(失败次数));
              if (失败次数 >= 最大失败次数) {
                await env.LOGIN_STATE.put(`lock_${设备标识}`, String(Date.now() + 锁定时间), { expirationTtl: 300 });
                return 创建HTML响应(生成登录界面(true, 锁定时间 / 1000));
              }
              return 创建HTML响应(生成登录界面(false, 0, true, 最大失败次数 - 失败次数));
            }
          case `/${订阅路径}/logout`:
            await env.LOGIN_STATE.delete('current_token');
            return 创建重定向响应('/login', { 'Set-Cookie': 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict' });
          case `/${订阅路径}/${小猫}${咪}`:
            await 加载节点和配置(env, hostName);
            const clashConfig = await 获取配置(env, 'clash', hostName);
            return new Response(clashConfig, { status: 200, headers: { "Content-Type": "text/plain;charset=utf-8" } });
          case `/${订阅路径}/${歪兔}${蕊蒽}`:
            await 加载节点和配置(env, hostName);
            const v2rayConfig = await 获取配置(env, 'v2ray', hostName);
            return new Response(v2rayConfig, { status: 200, headers: { "Content-Type": "text/plain;charset=utf-8" } });
          case `/${订阅路径}/upload`:
            const uploadToken = 请求.headers.get('Cookie')?.split('=')[1];
            const 有效UploadToken = await env.LOGIN_STATE.get('current_token');
            if (!uploadToken || uploadToken !== 有效UploadToken) {
              return 创建JSON响应({ error: '未登录或Token无效，请重新登录' }, 401);
            }
            formData = await 请求.formData();
            const ipFiles = formData.getAll('ipFiles');
            if (!ipFiles || ipFiles.length === 0) {
              return 创建JSON响应({ error: '未选择任何文件' }, 400);
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
                return 创建JSON响应({ error: '所有上传文件内容为空' }, 400);
              }
              const uniqueIpList = [...new Set(allIpList)];
              const 当前手动节点 = await env.LOGIN_STATE.get('manual_preferred_ips');
              const 当前节点列表 = 当前手动节点 ? JSON.parse(当前手动节点) : [];
              const 是重复上传 = JSON.stringify(当前节点列表.sort()) === JSON.stringify(uniqueIpList.sort());
              if (是重复上传) {
                return 创建JSON响应({ message: '上传内容与现有节点相同，无需更新' }, 200);
              }
              await env.LOGIN_STATE.put('manual_preferred_ips', JSON.stringify(uniqueIpList), { expirationTtl: 86400 });
              const 新版本 = String(Date.now());
              await env.LOGIN_STATE.put('ip_preferred_ips_version', 新版本);
              await env.LOGIN_STATE.put('config_clash', 生成猫咪配置(hostName), { expirationTtl: 86400 });
              await env.LOGIN_STATE.put('config_clash_version', 新版本);
              await env.LOGIN_STATE.put('config_v2ray', 生成备用配置(hostName), { expirationTtl: 86400 });
              await env.LOGIN_STATE.put('config_v2ray_version', 新版本);
              return 创建JSON响应({ message: '上传成功，即将跳转' }, 200, { 'Location': `/${订阅路径}` });
            } catch (错误) {
              console.error(`上传处理失败: ${错误.message}`);
              return 创建JSON响应({ error: `上传处理失败: ${错误.message}` }, 500);
            }
          default:
            url.hostname = 伪装域名;
            url.protocol = 'https:';
            return fetch(new Request(url, 请求));
        }
      } else if (请求头 === 'websocket') {
        反代地址 = env.PROXYIP || 反代地址;
        SOCKS5账号 = env.SOCKS5 || SOCKS5账号;
        启用SOCKS5 = env.SOCKS5OPEN === 'true' ? true : env.SOCKS5OPEN === 'false' ? false : 启用SOCKS5;
        启用全局SOCKS5 = env.SOCKS5GLOBAL === 'true' ? true : env.SOCKS5GLOBAL === 'false' ? false : 启用全局SOCKS5;
        return await 升级请求(请求);
      }
    } catch (error) {
      console.error(`全局错误: ${error.message}`);
      return 创建JSON响应({ error: `服务器内部错误: ${error.message}` }, 500);
    }
  }
};

// WebSocket相关函数（保持不变）
async function 升级请求(请求) {
  const 创建接口 = new WebSocketPair();
  const [客户端, 服务端] = Object.values(创建接口);
  服务端.accept();
  const 结果 = await 解析头(解密(请求.headers.get('sec-websocket-protocol')));
  if (!结果) return new Response('Invalid request', { status: 400 });
  const { TCP接口, 初始数据 } = 结果;
  建立管道(服务端, TCP接口, 初始数据);
  return new Response(null, { status: 101, webSocket: 客户端 });
}

function 解密(混淆字符) {
  混淆字符 = 混淆字符.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(混淆字符), c => c.charCodeAt(0)).buffer;
}

async function 解析头(数据) {
  const 数据数组 = new Uint8Array(数据);
  if (验证密钥(数据数组.slice(1, 17)) !== 开门锁匙) return null;

  const 数据定位 = 数据数组[17];
  const 端口 = new DataView(数据.slice(18 + 数据定位 + 1, 20 + 数据定位 + 1)).getUint16(0);
  const 地址索引 = 20 + 数据定位 + 1;
  const 地址类型 = 数据数组[地址索引];
  let 地址 = '';
  const 地址信息索引 = 地址索引 + 1;

  switch (地址类型) {
    case 1: 地址 = new Uint8Array(数据.slice(地址信息索引, 地址信息索引 + 4)).join('.'); break;
    case 2:
      const 地址长度 = 数据数组[地址信息索引];
      地址 = new TextDecoder().decode(数据.slice(地址信息索引 + 1, 地址信息索引 + 1 + 地址长度));
      break;
    case 3:
      地址 = Array.from({ length: 8 }, (_, i) => new DataView(数据.slice(地址信息索引, 地址信息索引 + 16)).getUint16(i * 2).toString(16)).join(':');
      break;
    default: return null;
  }

  const 初始数据 = 数据.slice(地址信息索引 + (地址类型 === 2 ? 数据数组[地址信息索引] + 1 : 地址类型 === 1 ? 4 : 16));
  let TCP接口;
  if (启用反代 && 启用SOCKS5 && 启用全局SOCKS5) {
    TCP接口 = await 创建SOCKS5(地址类型, 地址, 端口);
  } else {
    try {
      TCP接口 = connect({ hostname: 地址, port: 端口 });
      await TCP接口.opened;
    } catch {
      if (启用反代) {
        TCP接口 = 启用SOCKS5
          ? await 创建SOCKS5(地址类型, 地址, 端口)
          : connect({ hostname: 反代地址.split(':')[0], port: 反代地址.split(':')[1] || 端口 });
      }
    }
  }
  return { TCP接口, 初始数据 };
}

function 验证密钥(arr) {
  return Array.from(arr.slice(0, 16), b => b.toString(16).padStart(2, '0')).join('').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/).slice(1).join('-').toLowerCase();
}

async function 建立管道(服务端, TCP接口, 初始数据) {
  await 服务端.send(new Uint8Array([0, 0]).buffer);
  const 数据流 = new ReadableStream({
    async start(控制器) {
      if (初始数据) 控制器.enqueue(初始数据);
      服务端.addEventListener('message', event => 控制器.enqueue(event.data));
      服务端.addEventListener('close', () => { 控制器.close(); TCP接口.close(); setTimeout(() => 服务端.close(1000), 2); });
      服务端.addEventListener('error', () => { 控制器.close(); TCP接口.close(); setTimeout(() => 服务端.close(1001), 2); });
    }
  });
  数据流.pipeTo(new WritableStream({
    async write(数据) {
      const 写入器 = TCP接口.writable.getWriter();
      await 写入器.write(数据);
      写入器.releaseLock();
    }
  }));
  TCP接口.readable.pipeTo(new WritableStream({
    async write(数据) {
      await 服务端.send(数据);
    }
  }));
}

async function 创建SOCKS5(地址类型, 地址, 端口) {
  const { username, password, hostname, port } = await 解析SOCKS5账号(SOCKS5账号);
  const SOCKS5接口 = connect({ hostname, port });
  try {
    await SOCKS5接口.opened;
  } catch {
    return new Response('SOCKS5未连通', { status: 400 });
  }
  const writer = SOCKS5接口.writable.getWriter();
  const reader = SOCKS5接口.readable.getReader();
  const encoder = new TextEncoder();
  await writer.write(new Uint8Array([5, 2, 0, 2]));
  let res = (await reader.read()).value;
  if (res[1] === 0x02) {
    if (!username || !password) return 关闭接口();
    await writer.write(new Uint8Array([1, username.length, ...encoder.encode(username), password.length, ...encoder.encode(password)]));
    res = (await reader.read()).value;
    if (res[0] !== 0x01 || res[1] !== 0x00) return 关闭接口();
  }
  let 转换地址;
  switch (地址类型) {
    case 1: 转换地址 = new Uint8Array([1, ...地址.split('.').map(Number)]); break;
    case 2: 转换地址 = new Uint8Array([3, 地址.length, ...encoder.encode(地址)]); break;
    case 3: 转换地址 = new Uint8Array([4, ...地址.split(':').flatMap(x => [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)])]); break;
    default: return 关闭接口();
  }
  await writer.write(new Uint8Array([5, 1, 0, ...转换地址, 端口 >> 8, 端口 & 0xff]));
  res = (await reader.read()).value;
  if (res[0] !== 0x05 || res[1] !== 0x00) return 关闭接口();
  writer.releaseLock();
  reader.releaseLock();
  return SOCKS5接口;

  function 关闭接口() {
    writer.releaseLock();
    reader.releaseLock();
    SOCKS5接口.close();
    return new Response('SOCKS5握手失败', { status: 400 });
  }
}

async function 解析SOCKS5账号(SOCKS5) {
  const [latter, former] = SOCKS5.split("@").reverse();
  let username, password, hostname, port;
  if (former) [username, password] = former.split(":");
  const latters = latter.split(":");
  port = Number(latters.pop());
  hostname = latters.join(":");
  return { username, password, hostname, port };
}

// UI页面
function 生成注册页面() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background-image: url('${背景壁纸}'); background-size: cover; font-family: Arial, sans-serif; color: white; margin: 0; height: 100vh; display: flex; justify-content: center; align-items: center; }
    .content { background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)); padding: 30px; border-radius: 15px; max-width: 400px; width: 90%; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4); text-align: center; }
    h1 { font-size: 2em; color: #4CAF50; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); margin-bottom: 20px; }
    form { display: flex; flex-direction: column; gap: 15px; }
    input { padding: 12px; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.1); color: white; font-size: 16px; }
    input:focus { border-color: #4CAF50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.5); outline: none; }
    button { padding: 12px; background: linear-gradient(135deg, #4CAF50, #45a049); border: none; border-radius: 5px; color: white; cursor: pointer; transition: all 0.3s ease; }
    button:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
  </style>
</head>
<body>
  <div class="content">
    <h1>注册管理员账号</h1>
    <form action="/register/submit" method="POST">
      <input type="text" name="username" placeholder="用户名" required>
      <input type="password" name="password" placeholder="密码" required>
      <button type="submit">注册</button>
    </form>
  </div>
</body>
</html>
  `;
}

function 生成设置页面(hostName) {
  const 当前TXT路径 = 优选TXT路径.length ? 优选TXT路径.join('\n') : '';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background-image: url('${背景壁纸}'); background-size: cover; font-family: Arial, sans-serif; color: white; margin: 0; height: 100vh; display: flex; justify-content: center; align-items: center; }
    .content { background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)); padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4); }
    h1 { font-size: 2em; color: #4CAF50; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); margin-bottom: 20px; text-align: center; }
    .section { margin-bottom: 20px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
    h3 { color: #4CAF50; margin: 0 0 10px; }
    .toggle-btn { padding: 12px 24px; border-radius: 10px; border: none; color: white; cursor: pointer; font-size: 16px; transition: all 0.3s ease; width: 100%; }
    .toggle-btn.on { background: linear-gradient(135deg, #4CAF50, #45a049); }
    .toggle-btn.off { background: linear-gradient(135deg, #f44336, #d32f2f); }
    .toggle-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
    textarea { width: 100%; padding: 10px; border-radius: 5px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); color: white; resize: vertical; }
    button[type="submit"] { padding: 12px; background: linear-gradient(135deg, #2196F3, #1976D2); border: none; border-radius: 5px; color: white; cursor: pointer; width: 100%; transition: all 0.3s ease; }
    button[type="submit"]:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
  </style>
</head>
<body>
  <div class="content">
    <h1>设置</h1>
    <form action="/settings/update" method="POST">
      <div class="section">
        <h3>反代开关</h3>
        <button type="button" class="toggle-btn ${启用反代 ? 'on' : 'off'}" onclick="toggle(this, 'proxy')">${启用反代 ? '已开启' : '已关闭'}</button>
        <input type="hidden" name="proxy" id="proxy" value="${启用反代 ? 'on' : 'off'}">
      </div>
      <div class="section">
        <h3>SOCKS5 开关</h3>
        <button type="button" class="toggle-btn ${启用SOCKS5 ? 'on' : 'off'}" onclick="toggle(this, 'socks5')">${启用SOCKS5 ? '已开启' : '已关闭'}</button>
        <input type="hidden" name="socks5" id="socks5" value="${启用SOCKS5 ? 'on' : 'off'}">
      </div>
      <div class="section">
        <h3>优选 TXT 路径</h3>
        <textarea name="txtPaths" placeholder="一行一个域名">${当前TXT路径}</textarea>
      </div>
      <button type="submit">保存设置</button>
    </form>
  </div>
  <script>
    function toggle(button, fieldId) {
      const input = document.getElementById(fieldId);
      if (button.classList.contains('on')) {
        button.classList.remove('on');
        button.classList.add('off');
        button.textContent = '已关闭';
        input.value = 'off';
      } else {
        button.classList.remove('off');
        button.classList.add('on');
        button.textContent = '已开启';
        input.value = 'on';
      }
    }
  </script>
</body>
</html>
  `;
}

function 生成订阅页面(订阅路径, hostName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background-image: url('${背景壁纸}'); background-size: cover; background-position: center; background-attachment: fixed; background-repeat: no-repeat; font-family: Arial, sans-serif; color: white; margin: 0; height: 100vh; display: flex; justify-content: center; align-items: center; }
    .content { background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)); padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4); text-align: center; }
    h1 { font-size: 2em; color: #4CAF50; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); margin-bottom: 20px; }
    .link-container { margin-bottom: 20px; }
    .link-container p { margin: 10px 0; word-break: break-all; color: #ddd; }
    .link-container a { color: #4CAF50; text-decoration: none; transition: color 0.3s ease; }
    .link-container a:hover { color: #45a049; }
    .button-group { display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; margin-top: 20px; }
    .import-button, .logout-button { padding: 12px 24px; border-radius: 5px; color: white; text-decoration: none; border: none; cursor: pointer; font-size: 16px; transition: all 0.3s ease; }
    .import-button.clash { background: linear-gradient(135deg, #2196F3, #1976D2); }
    .import-button.v2ray { background: linear-gradient(135deg, #FF9800, #F57C00); }
    .import-button.settings { background: linear-gradient(135deg, #9C27B0, #7B1FA2); }
    .logout-button { background: linear-gradient(135deg, #f44336, #d32f2f); }
    .import-button:hover, .logout-button:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
    .upload-container { margin-top: 25px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; border: 1px dashed #4CAF50; }
    .upload-container h3 { margin: 0 0 15px; font-size: 1.2em; color: #4CAF50; }
    .upload-container input[type="file"] { display: none; }
    .upload-label { display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #4CAF50, #45a049); border-radius: 5px; cursor: pointer; transition: all 0.3s ease; }
    .upload-label:hover { background: linear-gradient(135deg, #45a049, #4CAF50); transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
    .file-list { margin-top: 15px; max-height: 100px; overflow-y: auto; text-align: left; }
    .file-list div { padding: 5px; background: rgba(255, 255, 255, 0.1); margin: 5px 0; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; }
    .file-list button { background: #f44336; border: none; border-radius: 3px; padding: 2px 8px; cursor: pointer; transition: all 0.3s ease; }
    .file-list button:hover { background: #d32f2f; }
    .upload-container button[type="submit"] { margin-top: 15px; padding: 10px 20px; background: linear-gradient(135deg, #2196F3, #1976D2); color: white; border: none; border-radius: 5px; cursor: pointer; transition: all 0.3s ease; }
    .upload-container button[type="submit"]:hover { background: linear-gradient(135deg, #1976D2, #2196F3); transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
    .progress-container { display: none; margin-top: 15px; }
    .progress-bar { width: 100%; height: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; overflow: hidden; position: relative; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #4CAF50, #45a049); width: 0; transition: width 0.3s ease; }
    .progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; color: white; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); }
  </style>
</head>
<body>
  <div class="content">
    <h1>订阅页面</h1>
    <p>支持${小猫}${咪}和${歪兔}${蕊蒽}客户端</p>
    <div class="link-container">
      <p>${小猫}${咪}客户端：<a href="https${符号}${hostName}/${订阅路径}/${小猫}${咪}">https${符号}${hostName}/${订阅路径}/${小猫}${咪}</a></p>
    </div>
    <div class="link-container">
      <p>${歪兔}${蕊蒽}客户端：<a href="https${符号}${hostName}/${订阅路径}/${歪兔}${蕊蒽}">https${符号}${hostName}/${订阅路径}/${歪兔}${蕊蒽}</a></p>
    </div>
    <div class="button-group">
      <button class="import-button clash" onclick="导入小猫咪('${订阅路径}', '${hostName}')">导入猫猫</button>
      <button class="import-button v2ray" onclick="导入${歪兔}${蕊蒽}('${订阅路径}', '${hostName}')">导入${歪兔}${蕊蒽}</button>
      <a href="/settings" class="import-button settings">设置</a>
      <a class="logout-button" href="/${订阅路径}/logout">退出登录</a>
    </div>
    <div class="upload-container">
      <h3>上传优选 IP</h3>
      <form id="uploadForm" action="/${订阅路径}/upload" method="POST" enctype="multipart/form-data">
        <label for="ipFiles" class="upload-label">选择文件</label>
        <input type="file" id="ipFiles" name="ipFiles" accept=".txt" multiple required onchange="显示文件()">
        <div class="file-list" id="fileList"></div>
        <button type="submit" onclick="开始上传(event)">上传</button>
        <div class="progress-container" id="progressContainer">
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
            <span class="progress-text" id="progressText">0%</span>
          </div>
        </div>
      </form>
    </div>
  </div>
  <script>
    function 导入小猫咪(订阅路径, hostName) { window.location.href = '${小猫}${咪}://install-config?url=https://' + hostName + '/${订阅路径}/${小猫}${咪}'; }
    function 导入${歪兔}${蕊蒽}(订阅路径, hostName) { window.location.href = '${歪兔}${蕊蒽}://install-config?url=https://' + hostName + '/${订阅路径}/${歪兔}${蕊蒽}'; }
    function 显示文件() {
      const fileInput = document.getElementById('ipFiles');
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '';
      Array.from(fileInput.files).forEach((file, index) => {
        const div = document.createElement('div');
        div.innerHTML = \`<span>\${file.name} (\${(file.size / 1024).toFixed(2)} KB)</span><button onclick="移除文件(\${index})">移除</button>\`;
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
        alert('请先选择文件！');
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
                window.location.href = response.Location || '/${订阅路径}';
              }, 500);
            }
          } else {
            throw new Error(response.error || '未知错误');
          }
        } catch (err) {
          progressContainer.style.display = 'none';
          alert(\`上传失败，状态码: \${xhr.status}，原因: \${err.message}\`);
        }
      };

      xhr.onerror = function() {
        progressContainer.style.display = 'none';
        alert('上传出错，可能是网络问题，请检查网络后重试！');
      };

      xhr.send(formData);
    }
  </script>
</body>
</html>
  `;
}

function 生成登录界面(锁定状态 = false, 剩余时间 = 0, 输错密码 = false, 剩余次数 = 0) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background-image: url('${背景壁纸}'); background-size: cover; background-position: center; background-attachment: fixed; background-repeat: no-repeat; font-family: Arial, sans-serif; color: white; margin: 0; height: 100vh; display: flex; justify-content: center; align-items: center; }
    .content { background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)); padding: 30px; border-radius: 15px; max-width: 400px; width: 90%; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4); text-align: center; }
    h1 { font-size: 2em; color: #4CAF50; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); margin-bottom: 20px; }
    .login-form { display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 320px; margin: 0 auto; }
    .login-form input { padding: 12px; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.1); color: white; font-size: 16px; width: 100%; box-sizing: border-box; transition: all 0.3s ease; }
    .login-form input:focus { border-color: #4CAF50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.5); outline: none; }
    .login-form button { padding: 12px 20px; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: all 0.3s ease; }
    .login-form button:hover { background: linear-gradient(135deg, #45a049, #4CAF50); transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
    .error-message { color: #ff6666; margin-top: 10px; font-size: 14px; animation: shake 0.5s ease-in-out; }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } }
    .lock-message { color: #ff6666; margin-top: 20px; font-size: 1.2em; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  </style>
</head>
<body>
  <div class="content">
    <h1>请登录路由器界面</h1>
    ${锁定状态 ? `
    <div class="lock-message">
      登录失败次数过多，请等待 <span id="countdown">${剩余时间}</span> 秒后再试。
    </div>
    ` : `
    <form class="login-form" action="/login/submit" method="POST">
      <input type="text" id="username" name="username" placeholder="账号" required>
      <input type="password" id="password" name="password" placeholder="密码" required>
      <button type="submit">登录</button>
    </form>
    ${输错密码 && 剩余次数 > 0 ? `<div class="error-message">账号或密码错误，剩余尝试次数：${剩余次数} 次。</div>` : ''}
    `}
  </div>
  <script>
    if (${锁定状态}) {
      const countdownElement = document.getElementById('countdown');
      const storageKey = 'lockEndTime';
      let lockEndTime = localStorage.getItem(storageKey) || (Date.now() + ${剩余时间} * 1000);
      localStorage.setItem(storageKey, lockEndTime);
      lockEndTime = Number(lockEndTime);

      function updateCountdown() {
        const remainingTime = Math.ceil((lockEndTime - Date.now()) / 1000);
        if (remainingTime > 0) countdownElement.textContent = remainingTime;
        else {
          clearInterval(timer);
          localStorage.removeItem(storageKey);
          fetch('/reset-login-failures', { method: 'POST' }).then(() => window.location.reload());
        }
      }

      let timer = setInterval(updateCountdown, 1000);
      updateCountdown();
    }
  </script>
</body>
</html>
  `;
}

function 生成KV未绑定提示页面() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { background-image: url('${背景壁纸}'); background-size: cover; background-position: center; background-attachment: fixed; background-repeat: no-repeat; font-family: Arial, sans-serif; color: white; margin: 0; height: 100vh; display: flex; justify-content: center; align-items: center; }
    .content { background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)); padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4); text-align: center; }
    h1 { font-size: 2em; color: #ff6666; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); margin-bottom: 20px; }
    p { font-size: 1.2em; line-height: 1.5; color: #ddd; }
    .highlight { color: #4CAF50; font-weight: bold; }
    .instruction { margin-top: 20px; font-size: 1.1em; color: #4CAF50; }
  </style>
</head>
<body>
  <div class="content">
    <h1>未绑定 KV 存储空间</h1>
    <p>当前服务未检测到已绑定的 <span class="highlight">Cloudflare KV 存储空间</span>。<br>请在 <span class="highlight">Cloudflare Workers</span> 设置中绑定一个 KV 命名空间（如 <span class="highlight">LOGIN_STATE</span>），然后重新部署服务以正常使用。</p>
    <div class="instruction">绑定 KV 后，请访问 <span class="highlight">/config</span> 路径进入订阅界面。</div>
  </div>
</body>
</html>
  `;
}

function 生成猫咪配置(hostName) {
  const 节点列表 = 优选节点.length ? 优选节点 : [`${hostName}:443`];
  const 郭嘉分组 = {};

  节点列表.forEach((节点, 索引) => {
    const [主内容, tls] = 节点.split("@");
    const [地址端口, 节点名字 = 节点名称] = 主内容.split("#");
    const [, 地址, 端口 = "443"] = 地址端口.match(/^\[(.*?)\](?::(\d+))?$/) || 地址端口.match(/^(.*?)(?::(\d+))?$/);
    const 修正地址 = 地址.includes(":") ? 地址.replace(/^\[|\]$/g, '') : 地址;
    const TLS开关 = tls === 'notls' ? 'false' : 'true';
    const 郭嘉 = 节点名字.split('-')[0] || '默认';
    const 地址类型 = 修正地址.includes(":") ? "IPv6" : "IPv4";

    郭嘉分组[郭嘉] = 郭嘉分组[郭嘉] || { IPv4: [], IPv6: [] };
    郭嘉分组[郭嘉][地址类型].push({
      name: `${节点名字}-${郭嘉分组[郭嘉][地址类型].length + 1}`,
      config: `- name: "${节点名字}-${郭嘉分组[郭嘉][地址类型].length + 1}"
  type: ${歪啦}${伊埃斯}
  server: ${修正地址}
  port: ${端口}
  uuid: ${开门锁匙}
  udp: false
  tls: ${TLS开关}
  sni: ${hostName}
  network: ws
  ws-opts:
    path: "/?ed=2560"
    headers:
      Host: ${hostName}`
    });
  });

  const 郭嘉列表 = Object.keys(郭嘉分组).sort();
  const 节点配置 = 郭嘉列表.flatMap(郭嘉 => [...郭嘉分组[郭嘉].IPv4, ...郭嘉分组[郭嘉].IPv6].map(n => n.config)).join("\n");
  const 郭嘉分组配置 = 郭嘉列表.map(郭嘉 => `
  - name: "${郭嘉}"
    type: url-test
    url: "http://www.gstatic.com/generate_204"
    interval: 120
    tolerance: 50
    proxies:
${[...郭嘉分组[郭嘉].IPv4, ...郭嘉分组[郭嘉].IPv6].map(n => `      - "${n.name}"`).join("\n")}
`).join("");

  return `# Generated at: ${new Date().toISOString()}
mixed-port: 7890
allow-lan: true
mode: Rule
log-level: info
external-controller: :9090
dns:
  enable: true
  listen: 0.0.0.0:53
  default-nameserver:
    - 8.8.8.8
    - 1.1.1.1
  enhanced-mode: fake-ip
  nameserver:
    - tls://8.8.8.8
    - tls://1.1.1.1
  fallback:
    - tls://9.9.9.9
    - tls://1.0.0.1
  fallback-filter:
    geoip: true
    ipcidr:
      - 240.0.0.0/4

proxies:
${节点配置}

proxy-groups:
  - name: "🚀节点选择"
    type: select
    proxies:
      - "🤪自动选择"
      - "🥰负载均衡"
${郭嘉列表.map(郭嘉 => `      - "${郭嘉}"`).join("\n")}

  - name: "🤪自动选择"
    type: url-test
    url: "http://www.gstatic.com/generate_204"
    interval: 120
    tolerance: 50
    proxies:
${郭嘉列表.map(郭嘉 => `      - "${郭嘉}"`).join("\n")}

  - name: "🥰负载均衡"
    type: load-balance
    strategy: round-robin
    proxies:
${郭嘉列表.map(郭嘉 => `      - "${郭嘉}"`).join("\n")}

${郭嘉分组配置}

rules:
  - GEOIP,LAN,DIRECT
  - DOMAIN-SUFFIX,cn,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,🚀节点选择
`;
}

function 生成备用配置(hostName) {
  const 节点列表 = 优选节点.length ? 优选节点 : [`${hostName}:443`];
  const 配置列表 = 节点列表.map(节点 => {
    try {
      const [主内容, tls = 'tls'] = 节点.split("@");
      const [地址端口, 节点名字 = 节点名称] = 主内容.split("#");
      const match = 地址端口.match(/^(?:\[([0-9a-fA-F:]+)\]|([^:]+))(?:\:(\d+))?$/);
      if (!match) return null;
      const 地址 = match[1] || match[2];
      const 端口 = match[3] || "443";
      if (!地址) return null;
      const 修正地址 = 地址.includes(":") ? `[${地址}]` : 地址;
      const TLS开关 = tls === 'notls' ? 'none' : 'tls';
      const encodedPath = encodeURIComponent('/?ed=2560');
      return `${歪啦}${伊埃斯}://${开门锁匙}@${修正地址}:${端口}?encryption=none&security=${TLS开关}&type=ws&host=${hostName}&path=${encodedPath}&sni=${hostName}#${节点名字}`;
    } catch (error) {
      console.error(`生成V2Ray节点配置失败: ${节点}, 错误: ${error.message}`);
      return null;
    }
  }).filter(Boolean);

  return `# Generated at: ${new Date().toISOString()}
${配置列表.length ? 配置列表.join("\n") : `${歪啦}${伊埃斯}://${开门锁匙}@${hostName}:443?encryption=none&security=tls&type=ws&host=${hostName}&path=${encodeURIComponent('/?ed=2560')}&sni=${hostName}#默认节点`}`;
}