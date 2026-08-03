import { connect } from 'cloudflare:sockets';
import { 共享状态 } from '../共享状态.js';
import { 获取或初始化UUID } from './节点配置.js';

// ====================== WebSocket处理 ======================
export async function 升级请求(请求, env) {
  const 创建接口 = new WebSocketPair();
  const [客户端, 服务端] = Object.values(创建接口);
  服务端.accept();
  const uuid = await 获取或初始化UUID(env);
  const TCP连接 = 创建请求TCP连接器(请求);
  const 结果 = await 解析头(解密(请求.headers.get('sec-websocket-protocol')), env, uuid, TCP连接);
  if (!结果) return new Response('Invalid request', { status: 400 });
  const { TCP接口, 初始数据 } = 结果;
  建立管道(服务端, TCP接口, 初始数据);
  return new Response(null, { status: 101, webSocket: 客户端 });
}

function 创建请求TCP连接器(请求) {
  const fetcher = 请求?.fetcher;
  if (!fetcher || typeof fetcher.connect !== 'function') {
    console.warn('request.fetcher.connect 不可用，回退到全局 connect');
    return (options) => connect(options);
  }
  return (options, init) => init === undefined ? fetcher.connect(options) : fetcher.connect(options, init);
}

function 解密(混淆字符) {
  混淆字符 = 混淆字符.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(混淆字符), c => c.charCodeAt(0)).buffer;
}

async function 解析头(数据, env, uuid, TCP连接) {
  const 数据数组 = new Uint8Array(数据);
  if (验证密钥(数据数组.slice(1, 17)) !== uuid) return null;

  const 数据定位 = 数据数组[17];
  const 端口 = new DataView(数据.slice(18 + 数据定位 + 1, 20 + 数据定位 + 1)).getUint16(0);
  const 地址索引 = 20 + 数据定位 + 1;
  const 地址类型 = 数据数组[地址索引];
  let 地址 = '';
  const 地址信息索引 = 地址索引 + 1;

  switch (地址类型) {
    case 1: 地址 = new Uint8Array(数据.slice(地址信息索引, 地址信息索引 + 4)).join('.'); break;
    case 2:
      const 地址Length = 数据数组[地址信息索引];
      地址 = new TextDecoder().decode(数据.slice(地址信息索引 + 1, 地址信息索引 + 1 + 地址Length));
      break;
    case 3:
      地址 = Array.from({ length: 8 }, (_, i) => new DataView(数据.slice(地址信息索引, 地址信息索引 + 16)).getUint16(i * 2).toString(16)).join(':');
      break;
    default: return null;
  }

  const 初始数据 = 数据.slice(地址信息索引 + (地址类型 === 2 ? 数据数组[地址信息索引] + 1 : 地址类型 === 1 ? 4 : 16));

  // 测速本地响应：如果未配置反代和SOCKS5，直接本地响应
  const 当前反代Address = (await env.KV数据库.get('proxyIP')) || env.PROXYIP || '';
  const SOCKS5Account = (await env.KV数据库.get('socks5')) || env.SOCKS5 || '';
  if (esSitioDePruebaVelocidad(地址) && !当前反代Address && !SOCKS5Account) {
    console.log(`[WebSocket] 测速请求，本地响应: ${地址}:${端口}`);
    return { TCP接口: null, 初始数据: construirRespuesta204Local() };
  }

  const TCP接口 = await 智能Connection(地址, 端口, 地址类型, env, TCP连接);
  return { TCP接口, 初始数据 };
}

function esSitioDePruebaVelocidad(hostname) {
  // 使用非 Cloudflare 测速地址，避免代理启用时超时
  const sitiosPrueba = ['gstatic.com', 'www.gstatic.com'];
  hostname = hostname.toLowerCase();
  return sitiosPrueba.some(dominio => hostname === dominio || hostname.endsWith('.' + dominio));
}

function construirRespuesta204Local() {
  return new TextEncoder().encode(
    'HTTP/1.1 204 No Content\r\n' +
    'Content-Length: 0\r\n' +
    'Connection: close\r\n' +
    '\r\n'
  );
}

async function 智能Connection(地址, 端口, 地址类型, env, TCP连接) {
  const 当前反代Address = 共享状态.反代地址;
  const SOCKS5Account = 共享状态.SOCKS5账号;

  if (!地址 || 地址.trim() === '') {
    return await 尝试直连(地址, 端口, TCP连接);
  }

  const 是域名 = 地址类型 === 2 && !地址.match(/^\d+\.\d+\.\d+\.\d+$/);
  const 是IP = 地址类型 === 1 || (地址类型 === 2 && 地址.match(/^\d+\.\d+\.\d+\.\d+$/)) || 地址类型 === 3;

  if (是域名 || 是IP) {
    const 代理启用 = await env.KV数据库.get('proxyEnabled') !== 'false';
    const 强制代理 = await env.KV数据库.get('forceProxy') === 'true';
    const 代理Type = await env.KV数据库.get('proxyType') || 'reverse';

    if (!代理启用) {
      return await 尝试直连(地址, 端口, TCP连接);
    }

    if (强制代理) {
        if (代理Type === 'reverse' && 当前反代Address) {
          try {
            const { hostname: 反代Host, port: 反代Port } = 解析反代地址端口(当前反代Address);
            const 连接 = TCP连接({ hostname: 反代Host, port: 反代Port || 端口 });
            await 连接.opened;
            console.log(`强制通过反代连接: ${当前反代Address}`);
            return 连接;
          } catch (错误) {
            console.error(`强制反代连接失败: ${错误.message}`);
            throw new Error(`强制反代失败: ${错误.message}`);
          }
        } else if (代理Type === 'socks5' && SOCKS5Account) {
          try {
            const SOCKS5连接 = await 创建SOCKS5(地址类型, 地址, 端口, SOCKS5Account, TCP连接);
            console.log(`强制通过 SOCKS5 连接: ${地址}:${端口}`);
            return SOCKS5连接;
          } catch (错误) {
            console.error(`强制 SOCKS5 连接失败: ${错误.message}`);
            throw new Error(`强制 SOCKS5 失败: ${错误.message}`);
          }
        }
    } else {
      try {
        const 连接 = await 尝试直连(地址, 端口, TCP连接);
        return 连接;
      } catch (错误) {
        console.log(`直连失败，动态切换到代理: ${错误.message}`);
        if (代理Type === 'reverse' && 当前反代Address) {
          try {
            const { hostname: 反代Host, port: 反代Port } = 解析反代地址端口(当前反代Address);
            const 连接 = TCP连接({ hostname: 反代Host, port: 反代Port || 端口 });
            await 连接.opened;
            console.log(`动态通过反代连接: ${当前反代Address}`);
            return 连接;
          } catch (错误) {
            console.error(`动态反代连接失败: ${错误.message}`);
          }
        } else if (代理Type === 'socks5' && SOCKS5Account) {
          try {
            const SOCKS5连接 = await 创建SOCKS5(地址类型, 地址, 端口, SOCKS5Account, TCP连接);
            console.log(`动态通过 SOCKS5 连接: ${地址}:${端口}`);
            return SOCKS5连接;
          } catch (错误) {
            console.error(`动态 SOCKS5 连接失败: ${错误.message}`);
          }
        }
        throw new Error(`所有连接尝试失败: ${错误.message}`);
      }
    }
  }

  return await 尝试直连(地址, 端口, TCP连接);
}

async function 解析反代地址端口(反代地址) {
  if (!反代地址) return { hostname: 反代地址, port: 443 };
  let 地址 = 反代地址, 端口 = 443;
  if (反代地址.includes(']:')) {
    const parts = 反代地址.split(']:');
    地址 = parts[0] + ']';
    端口 = parseInt(parts[1], 10) || 端口;
  } else if ((反代地址.match(/:/g) || []).length === 1 && !反代地址.startsWith('[')) {
    const colonIndex = 反代地址.lastIndexOf(':');
    地址 = 反代地址.slice(0, colonIndex);
    端口 = parseInt(反代地址.slice(colonIndex + 1), 10) || 端口;
  }
  return { hostname: 地址, port: 端口 };
}

async function 尝试直连(地址, 端口, TCP连接) {
  try {
    const 连接 = TCP连接({ hostname: 地址, port: 端口 });
    await 连接.opened;
    console.log(`回退到直连: ${地址}:${端口}`);
    return 连接;
  } catch (错误) {
    console.error(`直连失败: ${错误.message}`);
    throw new Error(`无法连接: ${错误.message}`);
  }
}

function 验证密钥(arr) {
  return Array.from(arr.slice(0, 16), b => b.toString(16).padStart(2, '0')).join('').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/).slice(1).join('-').toLowerCase();
}

async function 建立管道(服务端, TCP接口, 初始数据) {
  // Send VLESS success response
  await 服务端.send(new Uint8Array([0, 0]).buffer);

  // If no TCP connection (speed test local response), send the response and exit
  if (!TCP接口) {
    await 服务端.send(初始数据);
    return;
  }

  // Forward TCP -> WebSocket
  const tcpReader = TCP接口.readable.getReader();
  const forwardTCPToWS = async () => {
    try {
      while (true) {
        const { done, value } = await tcpReader.read();
        if (done) break;
        if (value && value.byteLength > 0) {
          await 服务端.send(value);
        }
      }
    } catch (e) {
      console.error(`[管道 TCP->WS] 错误: ${e.message}`);
    } finally {
      try { tcpReader.releaseLock(); } catch (e) { }
      try { 服务端.close(1000); } catch (e) { }
    }
  };

  // Forward WebSocket -> TCP
  const wsWriter = TCP接口.writable.getWriter();
  const forwardWSToTCP = async () => {
    try {
      // Send initial data if any
      if (初始数据 && 初始数据.byteLength > 0) {
        await wsWriter.write(初始数据);
      }

      // Listen for WebSocket messages
      for await (const msg of 服务端) {
        if (msg && msg.byteLength > 0) {
          await wsWriter.write(msg);
        }
      }
    } catch (e) {
      console.error(`[管道 WS->TCP] 错误: ${e.message}`);
    } finally {
      try { wsWriter.releaseLock(); } catch (e) { }
      try { TCP接口.close(); } catch (e) { }
    }
  };

  // Start both directions
  forwardTCPToWS();
  forwardWSToTCP();

  // Handle WebSocket close/error events
  服务端.addEventListener('close', () => {
    try { TCP接口.close(); } catch (e) { }
  });
  服务端.addEventListener('error', () => {
    try { TCP接口.close(); } catch (e) { }
  });
}

async function 创建SOCKS5(地址类型, 地址, 端口, socks5Account = null, TCP连接) {
  const 使用SOCKS5账号 = socks5Account || 共享状态.SOCKS5账号;
  const { username, password, hostname, port } = await 解析SOCKS5账号(使用SOCKS5账号);
  const SOCKS5Interface = TCP连接({ hostname, port });
  try {
    await SOCKS5Interface.opened;
  } catch (错误) {
    throw new Error(`SOCKS5未连通: ${错误.message}`);
  }
  const writer = SOCKS5Interface.writable.getWriter();
  const reader = SOCKS5Interface.readable.getReader();
  const encoder = new TextEncoder();
  await writer.write(new Uint8Array([5, 2, 0, 2]));
  let res = (await reader.read()).value;
  if (res[1] === 0x02) {
    if (!username || !password) throw new Error('SOCKS5需要认证但未提供账号密码');
    await writer.write(new Uint8Array([1, username.length, ...encoder.encode(username), password.length, ...encoder.encode(password)]));
    res = (await reader.read()).value;
    if (res[0] !== 0x01 || res[1] !== 0x00) throw new Error('SOCKS5认证失败');
  }
  let 转换地址;
  switch (地址类型) {
    case 1: 转换地址 = new Uint8Array([1, ...地址.split('.').map(Number)]); break;
    case 2: 转换地址 = new Uint8Array([3, 地址.length, ...encoder.encode(地址)]); break;
    case 3: 转换地址 = new Uint8Array([4, ...地址.split(':').flatMap(x => [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)])]); break;
    default: throw new Error(`不支持的地址类型: ${地址类型}`);
  }
  await writer.write(new Uint8Array([5, 1, 0, ...转换地址, 端口 >> 8, 端口 & 0xff]));
  res = (await reader.read()).value;
  if (res[0] !== 0x05 || res[1] !== 0x00) throw new Error('SOCKS5连接请求失败');
  writer.releaseLock();
  reader.releaseLock();
  return SOCKS5Interface;
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
