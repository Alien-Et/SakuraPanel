import { connect } from 'cloudflare:sockets';
import { 共享状态 } from '../共享状态.js';
import { 获取或初始化UUID } from './节点配置.js';

// ====================== WebSocket处理 ======================
export async function 升级请求(请求, env) {
  const 创建接口 = new WebSocketPair();
  const [客户端, 服务端] = Object.values(创建接口);
  try { (/** @type {any} */ (服务端)).accept({ allowHalfOpen: true }) }
  catch (_) { 服务端.accept() }
  服务端.binaryType = 'arraybuffer';

  const uuid = await 获取或初始化UUID(env);
  const TCP连接 = 创建请求TCP连接器(请求);
  const clientIP = 请求.headers.get('CF-Connecting-IP') || 'unknown';

  console.log(`[WebSocket] 新连接: IP=${clientIP} UA=${请求.headers.get('User-Agent') || 'unknown'}`);

  // 状态变量
  let TCP接口 = null;
  let 初始数据 = null;
  let 协议已识别 = false;
  let 转发已建立 = false;
  let WS消息队列 = Promise.resolve();

  // 写入TCP公共函数
  const 写入TCP = async (chunk) => {
    if (!chunk?.byteLength || !TCP接口?.writable) return;
    const writer = TCP接口.writable.getWriter();
    try {
      await writer.write(chunk);
    } catch (e) {
      console.error(`[WebSocket] 写入TCP失败: ${e.message}`);
    } finally {
      try { writer.releaseLock(); } catch (e) { }
    }
  };

  // 异步处理 WS 消息（队列模式，避免并发）
  const 处理消息 = async (data) => {
    if (转发已建立) {
      const chunk = 数据转Uint8Array(data);
      if (chunk && chunk.byteLength > 0) {
        console.log(`[WebSocket] 后续数据: ${chunk.byteLength} bytes`);
        await 写入TCP(chunk);
      }
      return;
    }

    const chunk = 数据转Uint8Array(data);
    console.log(`[WebSocket] 收到首包: ${chunk.byteLength} bytes`);
    if (!chunk.byteLength) return;

    // 解析 VLESS 首包
    if (!协议已识别) {
      协议已识别 = true;
      const 解析结果 = 解析VLESS首包(chunk, uuid);
      if (!解析结果) {
        console.error('[WebSocket] VLESS 首包解析失败');
        服务端.close(1008);
        return;
      }

      const { 地址, 端口, 地址类型, 剩余数据, respHeader } = 解析结果;
      console.log(`[WebSocket] VLESS 解析: 地址=${地址} 端口=${端口} 类型=${地址类型} 剩余数据=${剩余数据.byteLength} bytes`);

      // 测速本地响应
      const 当前反代Address = 共享状态.反代地址;
      const SOCKS5Account = 共享状态.SOCKS5账号;
      if (esSitioDePruebaVelocidad(地址) && !当前反代Address && !SOCKS5Account) {
        console.log(`[WebSocket] 测速请求，本地响应: ${地址}:${端口}`);
        初始数据 = construirRespuesta204Local();
      } else {
        try {
          console.log(`[WebSocket] 开始连接: ${地址}:${端口}`);
          TCP接口 = await 智能Connection(地址, 端口, 地址类型, env, TCP连接);
          console.log(`[WebSocket] 连接成功: ${地址}:${端口}`);
        } catch (错误) {
          console.error(`[WebSocket] 连接失败: ${错误.message}`);
          服务端.close(1011);
          return;
        }
      }

      // 发送 VLESS 响应
      console.log(`[WebSocket] 发送 VLESS 响应: [${respHeader[0]}, ${respHeader[1]}]`);
      await 服务端.send(respHeader);
      if (!TCP接口) {
        if (初始数据) {
          console.log(`[WebSocket] 发送本地响应: ${初始数据.byteLength} bytes`);
          await 服务端.send(初始数据);
        }
        服务端.close(1000);
        return;
      }

      转发已建立 = true;
      初始数据 = 剩余数据;
      console.log(`[WebSocket] 管道建立: 初始数据=${初始数据.byteLength} bytes`);

      // 启动管道
      建立管道(服务端, TCP接口, 初始数据);
      return;
    }

    // 后续数据直接写入 TCP
    console.log(`[WebSocket] 后续数据: ${chunk.byteLength} bytes`);
    await 写入TCP(chunk);
  };

  // 队列式消息处理
  const 入队消息 = (data) => {
    WS消息队列 = WS消息队列.then(() => 处理消息(data)).catch(e => {
      console.error(`[WebSocket] 消息处理错误: ${e.message}`);
    });
  };

  服务端.addEventListener('message', (event) => {
    入队消息(event.data);
  });

  服务端.addEventListener('close', () => {
    console.log(`[WebSocket] 客户端关闭: TCP接口=${TCP接口 ? '已建立' : '未建立'}`);
    try { TCP接口?.close(); } catch (e) { }
  });

  服务端.addEventListener('error', (err) => {
    console.error(`[WebSocket] 客户端错误: ${err.message || err}`);
    try { TCP接口?.close(); } catch (e) { }
  });

  // 处理 sec-websocket-protocol 中的 Early Data
  const earlyDataHeader = 请求.headers.get('sec-websocket-protocol') || '';
  if (earlyDataHeader) {
    try {
      const bytes = 解码WS早期数据(earlyDataHeader, uuid);
      if (bytes?.byteLength) {
        console.log(`[WebSocket] Early Data: ${bytes.byteLength} bytes`);
        入队消息(bytes);
      }
    } catch (错误) {
      console.error(`[WebSocket] Early Data 解析失败: ${错误.message}`);
    }
  }

  return new Response(null, { status: 101, webSocket: 客户端, headers: { 'Sec-WebSocket-Extensions': '' } });
}

function 数据转Uint8Array(data) {
  if (data instanceof Uint8Array) return data;
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  return new Uint8Array(0);
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

// 解析 VLESS 首包，返回 { 地址, 端口, 剩余数据, respHeader }
function 解析VLESS首包(数据, uuid) {
  const 数据数组 = new Uint8Array(数据);
  if (数据数组.byteLength < 18) return null;
  if (验证密钥(数据数组.slice(1, 17)) !== uuid) return null;

  const optLen = 数据数组[17];
  const cmdIndex = 18 + optLen;
  if (数据数组.byteLength < cmdIndex + 1) return null;
  const cmd = 数据数组[cmdIndex];
  if (cmd !== 1 && cmd !== 2) return null;

  const portIndex = cmdIndex + 1;
  if (数据数组.byteLength < portIndex + 3) return null;
  const 端口 = (数据数组[portIndex] << 8) | 数据数组[portIndex + 1];
  const addressType = 数据数组[portIndex + 2];
  const addressIndex = portIndex + 3;
  let 地址 = '';

  if (addressType === 1) {
    if (数据数组.byteLength < addressIndex + 4) return null;
    地址 = Array.from(数据数组.slice(addressIndex, addressIndex + 4)).join('.');
  } else if (addressType === 2) {
    if (数据数组.byteLength < addressIndex + 1) return null;
    const domainLen = 数据数组[addressIndex];
    if (数据数组.byteLength < addressIndex + 1 + domainLen) return null;
    地址 = new TextDecoder().decode(数据数组.slice(addressIndex + 1, addressIndex + 1 + domainLen));
  } else if (addressType === 3) {
    if (数据数组.byteLength < addressIndex + 16) return null;
    const ipv6 = [];
    for (let i = 0; i < 8; i++) {
      const base = addressIndex + i * 2;
      ipv6.push(((数据数组[base] << 8) | 数据数组[base + 1]).toString(16));
    }
    地址 = ipv6.join(':');
  } else {
    return null;
  }

  const headerLen = addressIndex + (addressType === 1 ? 4 : addressType === 2 ? 1 + 数据数组[addressIndex] : 16);
  const 剩余数据 = 数据数组.slice(headerLen);
  const respHeader = new Uint8Array([数据数组[0], 0]);

  return { 地址, 端口, 地址类型: addressType, 剩余数据, respHeader };
}

function esSitioDePruebaVelocidad(hostname) {
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
    throw new Error('目标地址为空');
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

function 是有效WS早期数据(bytes, token) {
  if (!bytes?.byteLength) return false;
  if (bytes.byteLength >= 18 && 验证密钥(bytes.slice(1, 17)) === token) return true;
  return false;
}

const WS早期数据最大头长度 = 4096;
const WS早期数据最大字节 = 65536;

function 解码WS早期数据(header, token) {
  if (!header) return null;
  if (header.length > WS早期数据最大头长度) throw new Error('early data is too large');

  let bytes;
  const Uint8ArrayBase64 = /** @type {any} */ (Uint8Array);
  if (typeof Uint8ArrayBase64.fromBase64 === 'function') {
    try {
      bytes = Uint8ArrayBase64.fromBase64(header, { alphabet: 'base64url' });
    } catch (_) { }
  }
  if (!bytes) {
    let normalized = header.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4;
    if (padding) normalized += '='.repeat(4 - padding);
    let binaryString;
    try {
      binaryString = atob(normalized);
    } catch (_) {
      return null;
    }
    bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  }

  if (bytes.byteLength > WS早期数据最大字节) throw new Error('early data is too large');
  return 是有效WS早期数据(bytes, token) ? bytes : null;
}

function 建立管道(服务端, TCP接口, 初始数据) {
  console.log(`[管道] 建立: TCP接口=${TCP接口 ? '已建立' : 'null'}`);
  if (!TCP接口) return;

  // Forward TCP -> WebSocket
  const tcpReader = TCP接口.readable.getReader();
  const forwardTCPToWS = async () => {
    try {
      let bytesCount = 0;
      let httpBuffer = new Uint8Array(0);
      while (服务端.readyState === WebSocket.OPEN) {
        const { done, value } = await Promise.race([
          tcpReader.read(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('TCP读取超时')), 5000)
          )
        ]).catch(e => {
          if (e.message === 'TCP读取超时') return { done: true };
          throw e;
        });
        
        if (done) {
          console.log(`[管道 TCP->WS] 结束: 共${bytesCount} bytes`);
          break;
        }
        if (value && value.byteLength > 0) {
          bytesCount += value.byteLength;
          
          // 尝试解析 HTTP 响应
          httpBuffer = 拼接字节数据(httpBuffer, value);
          try {
            const httpText = new TextDecoder().decode(httpBuffer);
            const headerEnd = httpText.indexOf('\r\n\r\n');
            if (headerEnd !== -1) {
              const headerText = httpText.slice(0, headerEnd);
              const firstLine = headerText.split('\r\n')[0];
              console.log(`[HTTP 响应] ${firstLine} (${bytesCount} bytes)`);
              httpBuffer = new Uint8Array(0); // 清空缓冲区
            }
          } catch (e) {
            // 忽略解析错误
          }
          
          try {
            await 服务端.send(value);
          } catch (e) {
            console.log(`[管道 TCP->WS] 发送失败: ${e.message}`);
            break;
          }
        }
      }
    } catch (e) {
      console.error(`[管道 TCP->WS] 错误: ${e.message}`);
    } finally {
      try { tcpReader.releaseLock(); } catch (e) { }
      try { if (服务端.readyState !== WebSocket.CLOSED) 服务端.close(1000); } catch (e) { }
    }
  };

  // Forward WebSocket -> TCP
  const wsWriter = TCP接口.writable.getWriter();
  const forwardWSToTCP = async () => {
    try {
      if (初始数据 && 初始数据.byteLength > 0) {
        console.log(`[管道 WS->TCP] 写入初始数据: ${初始数据.byteLength} bytes`);
        await wsWriter.write(初始数据);
      }
    } catch (e) {
      console.error(`[管道 WS->TCP] 写入初始数据失败: ${e.message}`);
    } finally {
      try { wsWriter.releaseLock(); } catch (e) { }
    }
  };

  // 监听后续 WS 消息
  const onMessage = async (event) => {
    const chunk = 数据转Uint8Array(event.data);
    if (!chunk || !chunk.byteLength) return;
    
    // 尝试解析 HTTP 请求
    try {
      const httpText = new TextDecoder().decode(chunk);
      const headerEnd = httpText.indexOf('\r\n\r\n');
      if (headerEnd !== -1) {
        const headerText = httpText.slice(0, headerEnd);
        const firstLine = headerText.split('\r\n')[0];
        const hostMatch = headerText.match(/^Host:\s*(.+)$/im);
        const host = hostMatch ? hostMatch[1] : 'unknown';
        console.log(`[HTTP 请求] ${firstLine} Host=${host} (${chunk.byteLength} bytes)`);
      }
    } catch (e) {
      // 忽略解析错误
    }
    
    const writer = TCP接口.writable.getWriter();
    try {
      await writer.write(chunk);
    } catch (e) {
      console.error(`[管道 WS->TCP] 写入失败: ${e.message}`);
    } finally {
      try { writer.releaseLock(); } catch (e) { }
    }
  };

  服务端.addEventListener('message', (event) => {
    console.log(`[管道 WS->TCP] 收到消息: ${数据转Uint8Array(event.data).byteLength} bytes`);
    onMessage(event);
  });
  服务端.addEventListener('close', () => {
    console.log(`[管道] 客户端关闭`);
    try { TCP接口.close(); } catch (e) { }
  });
  服务端.addEventListener('error', () => {
    console.log(`[管道] 客户端错误`);
    try { TCP接口.close(); } catch (e) { }
  });

  forwardTCPToWS();
  forwardWSToTCP();
}

function 拼接字节数据(现有, 新增) {
  const result = new Uint8Array(现有.byteLength + 新增.byteLength);
  result.set(现有);
  result.set(新增, 现有.byteLength);
  return result;
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
