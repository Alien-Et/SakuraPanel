import { connect } from 'cloudflare:sockets';
import { 共享状态 } from '../共享状态.js';
import { 获取或初始化UUID } from './节点配置.js';
import { D1获取, D1批量获取, log } from './辅助函数.js';

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
  
  // 并发拨号配置（参考代码默认值：TCP=2，反代=2）
  const TCP并发拨号数 = Math.max(1, Number(env.TCP_CONCURRENT_DIAL) || 2);
  const 反代并发拨号数 = Math.max(1, Number(env.PROXY_CONCURRENT_DIAL) || 2);

  log(`[WebSocket] 新连接: IP=${clientIP} UA=${请求.headers.get('User-Agent') || 'unknown'}`);

  // 状态变量
  let TCP接口 = null;
  let 初始数据 = null;
  let 协议已识别 = false;
  let 转发已建立 = false;
  let WS消息队列 = Promise.resolve();

  // 写入TCP公共函数
  const 写入TCP = async (chunk) => {
    if (!chunk?.byteLength || !TCP接口?.writable) return;
    
    // 尝试解析 HTTP 请求
    try {
      const httpText = new TextDecoder().decode(chunk);
      const headerEnd = httpText.indexOf('\r\n\r\n');
      if (headerEnd !== -1) {
        const headerText = httpText.slice(0, headerEnd);
        const firstLine = headerText.split('\r\n')[0];
        const hostMatch = httpText.match(/^Host:\s*(.+)$/im);
        const host = hostMatch ? hostMatch[1] : 'unknown';
        log(`[HTTP 请求] ${firstLine} Host=${host} (${chunk.byteLength} bytes)`);
      }
    } catch (e) {
      // 忽略解析错误
    }
    
    const writer = TCP接口.writable.getWriter();
    try {
      await writer.write(chunk);
      log(`[管道 WS->TCP] 写入: ${chunk.byteLength} bytes`);
    } catch (e) {
      console.error(`[管道 WS->TCP] 写入失败: ${e.message}`);
    } finally {
      try { writer.releaseLock(); } catch (e) { }
    }
  };

  // 异步处理 WS 消息（队列模式，避免并发）
  const 处理消息 = async (data) => {
    if (转发已建立) {
      const chunk = 数据转Uint8Array(data);
      if (chunk && chunk.byteLength > 0) {
        log(`[WebSocket] 后续数据: ${chunk.byteLength} bytes`);
        await 写入TCP(chunk);
      }
      return;
    }

    const chunk = 数据转Uint8Array(data);
    log(`[WebSocket] 收到首包: ${chunk.byteLength} bytes`);
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
      log(`[WebSocket] VLESS 解析: 地址=${地址} 端口=${端口} 类型=${地址类型} 剩余数据=${剩余数据.byteLength} bytes`);

      // 测速本地响应
      const 当前反代Address = 共享状态.反代地址;
      const SOCKS5Account = 共享状态.SOCKS5账号;
      if (esSitioDePruebaVelocidad(地址) && !当前反代Address && !SOCKS5Account) {
        log(`[WebSocket] 测速请求，本地响应: ${地址}:${端口}`);
        初始数据 = construirRespuesta204Local();
      } else {
        try {
          log(`[WebSocket] 开始连接: ${地址}:${端口}`);
          TCP接口 = await 智能Connection(地址, 端口, 地址类型, env, TCP连接, TCP并发拨号数, 反代并发拨号数);
          log(`[WebSocket] 连接成功: ${地址}:${端口}`);
        } catch (错误) {
          console.error(`[WebSocket] 连接失败: ${错误.message}`);
          服务端.close(1011);
          return;
        }
      }

      // 发送 VLESS 响应
      log(`[WebSocket] 发送 VLESS 响应: [${respHeader[0]}, ${respHeader[1]}]`);
      await 服务端.send(respHeader);
      if (!TCP接口) {
        if (初始数据) {
          log(`[WebSocket] 发送本地响应: ${初始数据.byteLength} bytes`);
          await 服务端.send(初始数据);
        }
        服务端.close(1000);
        return;
      }

      转发已建立 = true;
      初始数据 = 剩余数据;
      log(`[WebSocket] 管道建立: 初始数据=${初始数据.byteLength} bytes`);

      // 启动管道
      await 建立管道(服务端, TCP接口, 初始数据);
      return;
    }

    // 后续数据直接写入 TCP
    log(`[WebSocket] 后续数据: ${chunk.byteLength} bytes`);
    await 写入TCP(chunk);
  };

  // 队列式消息处理
  const 入队消息 = (data) => {
    WS消息队列 = WS消息队列.then(() => 处理消息(data)).catch(e => {
      console.error(`[WebSocket] 消息处理错误: ${e.message}`);
    });
  };

  服务端.addEventListener('message', (event) => {
    log(`[WebSocket] 收到消息: ${数据转Uint8Array(event.data).byteLength} bytes`);
    入队消息(event.data);
  });

  服务端.addEventListener('close', () => {
    log(`[WebSocket] 客户端关闭: TCP接口=${TCP接口 ? '已建立' : '未建立'}`);
    try { TCP接口?.close(); } catch (e) { }
  });

  服务端.addEventListener('error', (err) => {
    console.error(`[WebSocket] 客户端错误: ${err.message || err}`);
    try { TCP接口?.close(); } catch (e) { }
  });

  // 处理 sec-websocket-protocol 中的 Early Data
  const earlyDataHeader = 请求.headers.get('sec-websocket-protocol') || '';
  log(`[WebSocket] Early Data 头部: ${earlyDataHeader ? '存在(' + earlyDataHeader.length + ' chars)' : '不存在'}`);
  if (earlyDataHeader) {
    try {
      const bytes = 解码WS早期数据(earlyDataHeader, uuid);
      log(`[WebSocket] Early Data 解码: ${bytes?.byteLength || 0} bytes`);
      if (bytes?.byteLength) {
        log(`[WebSocket] Early Data: ${bytes.byteLength} bytes`);
        入队消息(bytes);
      }
    } catch (错误) {
      console.error(`[WebSocket] Early Data 解析失败: ${错误.message}`);
    }
  }

  log(`[WebSocket] 等待客户端消息...`);

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
    log('request.fetcher.connect 不可用，回退到全局 connect');
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
  log('[VLESS解析] 开始解析首包，数据总长度:', 数据数组.byteLength);
  if (数据数组.byteLength < 18) {
    log('[VLESS解析] 数据长度不足18字节，放弃解析');
    return null;
  }
  log('[VLESS解析] 版本字节:', 数据数组[0]);
  const uuid验证结果 = 验证密钥(数据数组.slice(1, 17)) === uuid;
  log('[VLESS解析] UUID验证结果:', uuid验证结果);
  if (!uuid验证结果) {
    const 计算UUID = 验证密钥(数据数组.slice(1, 17));
    log('[VLESS解析] UUID不匹配，计算值:', 计算UUID, '期望值:', uuid);
    return null;
  }

  const optLen = 数据数组[17];
  log('[VLESS解析] optLen:', optLen);
  const cmdIndex = 18 + optLen;
  if (数据数组.byteLength < cmdIndex + 1) {
    log('[VLESS解析] 数据长度不足，无法读取cmd');
    return null;
  }
  const cmd = 数据数组[cmdIndex];
  log('[VLESS解析] cmd:', cmd, 'cmdIndex:', cmdIndex);
  if (cmd !== 1 && cmd !== 2 && cmd !== 3) {
    log('[VLESS解析] cmd不是1/2/3，放弃解析');
    return null;
  }

  const portIndex = cmdIndex + 1;
  if (数据数组.byteLength < portIndex + 3) {
    log('[VLESS解析] 数据长度不足，无法读取端口');
    return null;
  }
  const 端口 = (数据数组[portIndex] << 8) | 数据数组[portIndex + 1];
  const addressType = 数据数组[portIndex + 2];
  log('[VLESS解析] 端口:', 端口, '地址类型:', addressType, 'portIndex:', portIndex);
  const addressIndex = portIndex + 3;
  let 地址 = '';

  if (addressType === 1) {
    if (数据数组.byteLength < addressIndex + 4) {
      log('[VLESS解析] 数据长度不足，无法读取IPv4地址');
      return null;
    }
    地址 = Array.from(数据数组.slice(addressIndex, addressIndex + 4)).join('.');
    log('[VLESS解析] 解析到IPv4地址:', 地址);
  } else if (addressType === 2) {
    if (数据数组.byteLength < addressIndex + 1) {
      log('[VLESS解析] 数据长度不足，无法读取域名长度');
      return null;
    }
    const domainLen = 数据数组[addressIndex];
    if (数据数组.byteLength < addressIndex + 1 + domainLen) {
      log('[VLESS解析] 数据长度不足，无法读取完整域名');
      return null;
    }
    地址 = new TextDecoder().decode(数据数组.slice(addressIndex + 1, addressIndex + 1 + domainLen));
    log('[VLESS解析] 解析到域名:', 地址, '域名长度:', domainLen);
  } else if (addressType === 3) {
    if (数据数组.byteLength < addressIndex + 16) {
      log('[VLESS解析] 数据长度不足，无法读取IPv6地址');
      return null;
    }
    const ipv6 = [];
    for (let i = 0; i < 8; i++) {
      const base = addressIndex + i * 2;
      ipv6.push(((数据数组[base] << 8) | 数据数组[base + 1]).toString(16));
    }
    地址 = ipv6.join(':');
    log('[VLESS解析] 解析到IPv6地址:', 地址);
  } else {
    log('[VLESS解析] 不支持的地址类型:', addressType, '放弃解析');
    return null;
  }

  const headerLen = addressIndex + (addressType === 1 ? 4 : addressType === 2 ? 1 + 数据数组[addressIndex] : 16);
  const 剩余数据 = 数据数组.slice(headerLen);
  const respHeader = new Uint8Array([数据数组[0], 0]);
  log('[VLESS解析] 解析完成，地址:', 地址, '端口:', 端口, '剩余数据长度:', 剩余数据.byteLength, 'headerLen:', headerLen);

  return { 地址, 端口, 地址类型: addressType, 剩余数据, respHeader };
}

function esSitioDePruebaVelocidad(hostname) {
  const sitiosPrueba = [
    // Cloudflare
    'cp.cloudflare.com',
    // Google
    'gstatic.com',
    'www.gstatic.com',
    'clients3.google.com',
    'connectivitycheck.gstatic.com',
    // Apple
    'apple.com',
    'www.apple.com',
    'captive.apple.com',
    // Microsoft
    'msftconnecttest.com',
    // Firefox
    'detectportal.firefox.com'
  ];
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

async function 智能Connection(地址, 端口, 地址类型, env, TCP连接, TCP并发拨号数, 反代并发拨号数) {
  const 当前反代Address = 共享状态.反代地址;
  const SOCKS5Account = 共享状态.SOCKS5账号;
  log(`[智能连接] 开始: 地址=${地址} 端口=${端口} 类型=${地址类型} 反代=${当前反代Address || '无'} SOCKS5=${SOCKS5Account || '无'}`);

  if (!地址 || 地址.trim() === '') {
    console.error('[智能连接] 目标地址为空');
    throw new Error('目标地址为空');
  }

  const 是域名 = 地址类型 === 2 && !地址.match(/^\d+\.\d+\.\d+\.\d+$/);
  const 是IP = 地址类型 === 1 || (地址类型 === 2 && 地址.match(/^\d+\.\d+\.\d+\.\d+$/)) || 地址类型 === 3;

  if (是域名 || 是IP) {
    const proxySettings = await D1批量获取(env, ['proxyEnabled', 'forceProxy', 'proxyType']);
    const 代理启用 = proxySettings.proxyEnabled !== 'false';
    const 强制代理 = proxySettings.forceProxy === 'true';
    const 代理Type = proxySettings.proxyType || 'reverse';

    if (!代理启用) {
      log(`[智能连接] 代理已禁用，直连: ${地址}:${端口}`);
      return await 尝试直连(地址, 端口, TCP连接);
    }

    if (强制代理) {
        if (代理Type === 'reverse' && 当前反代Address) {
          try {
            const 候选列表 = await 解析反代为候选列表(当前反代Address, 反代并发拨号数);
            log(`[智能连接] 强制反代: 候选=${候选列表.map(c => `${c.hostname}:${c.port}`).join(', ')} 目标=${地址}:${端口}`);
            const 连接 = await 并发拨号(候选列表, TCP连接, TCP并发拨号数);
            log(`[智能连接] 强制反代连接成功`);
            return 连接;
          } catch (错误) {
            console.error(`[智能连接] 强制反代连接失败: ${错误.message}`);
            throw new Error(`强制反代失败: ${错误.message}`);
          }
        } else if (代理Type === 'socks5' && SOCKS5Account) {
          try {
            log(`[智能连接] 强制SOCKS5: ${地址}:${端口}`);
            const SOCKS5连接 = await 创建SOCKS5(地址类型, 地址, 端口, SOCKS5Account, TCP连接);
            log(`[智能连接] 强制SOCKS5连接成功`);
            return SOCKS5连接;
          } catch (错误) {
            console.error(`[智能连接] 强制SOCKS5连接失败: ${错误.message}`);
            throw new Error(`强制SOCKS5失败: ${错误.message}`);
          }
        }
    } else {
      try {
        const 连接 = await 尝试直连(地址, 端口, TCP连接);
        return 连接;
      } catch (错误) {
        log(`[智能连接] 直连失败，动态切换代理: ${错误.message}`);
        if (代理Type === 'reverse' && 当前反代Address) {
          try {
            const 候选列表 = await 解析反代为候选列表(当前反代Address, 反代并发拨号数);
            log(`[智能连接] 动态反代: 候选=${候选列表.map(c => `${c.hostname}:${c.port}`).join(', ')} 目标=${地址}:${端口}`);
            const 连接 = await 并发拨号(候选列表, TCP连接, TCP并发拨号数);
            log(`[智能连接] 动态反代连接成功`);
            return 连接;
          } catch (错误) {
            console.error(`[智能连接] 动态反代连接失败: ${错误.message}`);
          }
        } else if (代理Type === 'socks5' && SOCKS5Account) {
          try {
            log(`[智能连接] 动态SOCKS5: ${地址}:${端口}`);
            const SOCKS5连接 = await 创建SOCKS5(地址类型, 地址, 端口, SOCKS5Account, TCP连接);
            log(`[智能连接] 动态SOCKS5连接成功`);
            return SOCKS5连接;
          } catch (错误) {
            console.error(`[智能连接] 动态SOCKS5连接失败: ${错误.message}`);
          }
        }
        throw new Error(`所有连接尝试失败: ${错误.message}`);
      }
    }
  }

  log(`[智能连接] 非IP/域名，直接直连: ${地址}:${端口}`);
  return await 尝试直连(地址, 端口, TCP连接);
}

async function 解析反代地址端口(反代地址) {
  if (!反代地址) return [{ hostname: 反代地址, port: 443 }];
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
  return [{ hostname: 地址, port: 端口 }];
}

// DoH 查询缓存
const DoH缓存 = {};
const DoH缓存最大条目 = 1000;
const DoH记录类型映射 = { A: 1, AAAA: 28, TXT: 16 };

async function DoH查询(域名, 记录类型, DoH解析服务 = 'https://cloudflare-dns.com/dns-query') {
  const 规范化域名 = String(域名 || '').trim().toLowerCase().replace(/\.$/, '');
  const 规范化记录类型 = String(记录类型 || '').trim().toUpperCase();
  const 缓存键 = `${规范化域名}:${规范化记录类型}`;
  const qtype = DoH记录类型映射[规范化记录类型] || 1;
  const 当前时间戳 = Date.now();
  const 现缓存项 = DoH缓存[缓存键];
  if (现缓存项 && 当前时间戳 < 现缓存项.过期时间) {
    log(`[DoH查询] 命中缓存 ${域名} ${记录类型}`);
    return 现缓存项.data.map(data => ({ type: qtype, data }));
  }
  const 开始时间 = performance.now();
  log(`[DoH查询] 开始查询 ${域名} ${记录类型} via ${DoH解析服务}`);
  try {
    const 编码域名 = (name) => {
      const parts = name.endsWith('.') ? name.slice(0, -1).split('.') : name.split('.');
      const bufs = [];
      for (const label of parts) {
        const enc = new TextEncoder().encode(label);
        bufs.push(new Uint8Array([enc.length]), enc);
      }
      bufs.push(new Uint8Array([0]));
      const total = bufs.reduce((s, b) => s + b.length, 0);
      const result = new Uint8Array(total);
      let off = 0;
      for (const b of bufs) { result.set(b, off); off += b.length }
      return result;
    };

    const qname = 编码域名(规范化域名);
    const query = new Uint8Array(12 + qname.length + 4);
    const qview = new DataView(query.buffer);
    qview.setUint16(0, crypto.getRandomValues(new Uint16Array(1))[0]);
    qview.setUint16(2, 0x0100);
    qview.setUint16(4, 1);
    query.set(qname, 12);
    qview.setUint16(12 + qname.length, qtype);
    qview.setUint16(12 + qname.length + 2, 1);

    const response = await fetch(DoH解析服务, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/dns-message',
        'Accept': 'application/dns-message',
      },
      body: query,
    });
    if (!response.ok) {
      log(`[DoH查询] 请求失败 ${域名} ${记录类型} 响应代码:${response.status}`);
      return [];
    }

    const buf = new Uint8Array(await response.arrayBuffer());
    const dv = new DataView(buf.buffer);
    const ancount = dv.getUint16(6);
    log(`[DoH查询] 收到响应 ${域名} ${记录类型} (${buf.length}字节, ${ancount}条应答)`);

    const answers = [];
    let offset = 12;
    const qdcount = dv.getUint16(4);
    for (let i = 0; i < qdcount; i++) {
      let p = offset, safe = 128;
      while (p < buf.length && safe-- > 0) {
        const len = buf[p];
        if (len === 0) { offset = p + 1; break; }
        if ((len & 0xC0) === 0xC0) { offset = p + 2; break; }
        p += len + 1;
      }
      offset += 4;
    }
    for (let i = 0; i < ancount && offset < buf.length; i++) {
      let p = offset, safe = 128;
      while (p < buf.length && safe-- > 0) {
        const len = buf[p];
        if (len === 0) { p++; break; }
        if ((len & 0xC0) === 0xC0) { p += 2; break; }
        p += len + 1;
      }
      offset = p;
      const type = dv.getUint16(offset); offset += 2;
      offset += 2;
      const ttl = dv.getUint32(offset); offset += 4;
      const rdlen = dv.getUint16(offset); offset += 2;
      const rdata = buf.slice(offset, offset + rdlen);
      offset += rdlen;

      let data;
      if (type === 1 && rdlen === 4) {
        data = `${rdata[0]}.${rdata[1]}.${rdata[2]}.${rdata[3]}`;
      } else if (type === 28 && rdlen === 16) {
        const segs = [];
        for (let j = 0; j < 16; j += 2) segs.push(((rdata[j] << 8) | rdata[j + 1]).toString(16));
        data = segs.join(':');
      } else if (type === 16) {
        const parts = [];
        let tOff = 0;
        while (tOff < rdlen) {
          const tLen = rdata[tOff++];
          parts.push(new TextDecoder().decode(rdata.slice(tOff, tOff + tLen)));
          tOff += tLen;
        }
        data = parts.join('');
      } else {
        data = Array.from(rdata).map(b => b.toString(16).padStart(2, '0')).join('');
      }
      answers.push({ type, TTL: ttl, data });
    }

    const 耗时 = (performance.now() - 开始时间).toFixed(2);
    log(`[DoH查询] 查询完成 ${域名} ${记录类型} ${耗时}ms 共${answers.length}条结果`);
    const 相关记录 = answers.filter(answer => answer.type === qtype);
    const 缓存数据 = 相关记录.map(answer => answer.data);
    if (相关记录.length > 0) {
      const 缓存TTL = Math.max(300, Math.min(...相关记录.map(a => a.TTL)));
      DoH缓存[缓存键] = { data: 缓存数据, 过期时间: Date.now() + 缓存TTL * 1000 };
    } else {
      log(`[DoH查询] 未获取到${记录类型}记录，不缓存空结果: ${域名}`);
    }
    if (Object.keys(DoH缓存).length > DoH缓存最大条目) {
      const 清理时间戳 = Date.now();
      for (const [k, v] of Object.entries(DoH缓存)) {
        if (清理时间戳 >= v.过期时间) delete DoH缓存[k];
      }
    }
    return answers;
  } catch (error) {
    const 耗时 = (performance.now() - 开始时间).toFixed(2);
    console.error(`[DoH查询] 查询失败 ${域名} ${记录类型} ${耗时}ms:`, error);
    return [];
  }
}

// 并发拨号
async function 并发拨号(候选列表, TCP连接, 最大并发数) {
  // 限制并发数，避免浪费资源
  const 实际候选列表 = 候选列表.slice(0, 最大并发数);
  
  if (实际候选列表.length === 1) {
    const 候选 = 实际候选列表[0];
    const socket = TCP连接({ hostname: 候选.hostname, port: 候选.port });
    await socket.opened;
    return socket;
  }
  
  const attempts = 实际候选列表.map(候选 => {
    const socket = TCP连接({ hostname: 候选.hostname, port: 候选.port });
    return socket.opened.then(() => ({ socket, candidate: 候选 })).catch((错误) => {
      log(`[并发拨号] 候选 ${候选.hostname}:${候选.port} 失败: ${错误.message}`);
      throw { socket, candidate: 候选, 错误 };
    });
  });
  
  let winner = null;
  try {
    winner = await Promise.any(attempts);
    return winner.socket;
  } finally {
    // 关闭其他未成功的连接，释放资源
    if (winner) {
      for (const attempt of attempts) {
        attempt.catch(({ socket }) => {
          try { socket?.close?.(); } catch (e) { }
        });
      }
    }
  }
}

// 解析反代域名为多个 IP
async function 解析反代为候选列表(反代地址, 最大候选数) {
  if (!反代地址) return [{ hostname: '127.0.0.1', port: 443 }];
  
  // 如果是 IP:PORT 格式，直接返回
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)(?::\d+)?$/;
  if (ipv4Regex.test(反代地址)) {
    const colonIndex = 反代地址.lastIndexOf(':');
    const host = colonIndex > 0 ? 反代地址.slice(0, colonIndex) : 反代地址;
    const port = colonIndex > 0 ? parseInt(反代地址.slice(colonIndex + 1), 10) : 443;
    return [{ hostname: host, port }];
  }

  // 解析域名
  const colonIndex = 反代地址.lastIndexOf(':');
  const host = colonIndex > 0 && !反代地址.startsWith('[') ? 反代地址.slice(0, colonIndex) : 反代地址;
  const port = colonIndex > 0 && !反代地址.startsWith('[') ? parseInt(反代地址.slice(colonIndex + 1), 10) : 443;

  const [aRecords, aaaaRecords] = await Promise.all([
    DoH查询(host, 'A'),
    DoH查询(host, 'AAAA')
  ]);

  const 候选列表 = [];
  for (const r of aRecords) {
    if (r.type === 1 && typeof r.data === 'string') {
      候选列表.push({ hostname: r.data, port });
    }
  }
  for (const r of aaaaRecords) {
    if (r.type === 28 && typeof r.data === 'string') {
      候选列表.push({ hostname: `[${r.data}]`, port });
    }
  }

  if (候选列表.length === 0) {
    log(`[反代解析] 未获取到IP，回退到原域名: ${host}`);
    return [{ hostname: host, port }];
  }

  // 限制候选数量，只保留前 N 个（N = 最大候选数）
  const 实际候选列表 = 候选列表.slice(0, 最大候选数);
  if (候选列表.length > 最大候选数) {
    log(`[反代解析] 限制并发拨号数: ${候选列表.length} -> ${最大候选数}`);
  }
  
  log(`[反代解析] ${host} 解析到 ${候选列表.length} 个IP，使用前${实际候选列表.length}个: ${实际候选列表.map(c => `${c.hostname}:${c.port}`).join(', ')}`);
  return 实际候选列表;
}

async function 尝试直连(地址, 端口, TCP连接) {
  log(`[直连] 开始: ${地址}:${端口}`);
  try {
    const 连接 = TCP连接({ hostname: 地址, port: 端口 });
    await 连接.opened;
    log(`[直连] 成功: ${地址}:${端口}`);
    return 连接;
  } catch (错误) {
    console.error(`[直连] 失败: ${地址}:${端口} - ${错误.message}`);
    throw new Error(`无法连接: ${错误.message}`);
  }
}

function 验证密钥(arr) {
  return Array.from(arr.slice(0, 16), b => b.toString(16).padStart(2, '0')).join('').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/).slice(1).join('-').toLowerCase();
}

function 是有效WS早期数据(bytes, token) {
  if (!bytes?.byteLength) return false;
  const 计算UUID = 验证密钥(bytes.slice(1, 17));
  log(`[EarlyData] 验证: 长度=${bytes.byteLength} 计算UUID=${计算UUID} 期望UUID=${token} 匹配=${计算UUID === token}`);
  if (bytes.byteLength >= 18 && 计算UUID === token) return true;
  return false;
}

const WS早期数据最大头长度 = 4096;
const WS早期数据最大字节 = 65536;

function 解码WS早期数据(header, token) {
  if (!header) return null;
  if (header.length > WS早期数据最大头长度) throw new Error('early data is too large');

  let bytes;
  const Uint8ArrayBase64 = /** @type {any} */ (Uint8Array);
  let 解码方式 = '';
  if (typeof Uint8ArrayBase64.fromBase64 === 'function') {
    try {
      bytes = Uint8ArrayBase64.fromBase64(header, { alphabet: 'base64url' });
      解码方式 = 'Uint8Array.fromBase64';
    } catch (_) { }
  }
  if (!bytes) {
    let normalized = header.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4;
    if (padding) normalized += '='.repeat(4 - padding);
    let binaryString;
    try {
      binaryString = atob(normalized);
      解码方式 = 'atob';
    } catch (_) {
      console.error(`[EarlyData] Base64 解码失败`);
      return null;
    }
    bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  }
  log(`[EarlyData] 解码成功: 方式=${解码方式} 长度=${bytes.byteLength}`);
  if (bytes.byteLength > WS早期数据最大字节) throw new Error('early data is too large');
  const result = 是有效WS早期数据(bytes, token) ? bytes : null;
  log(`[EarlyData] 验证结果: ${result ? '有效' : '无效'}`);
  return result;
}

async function 建立管道(服务端, TCP接口, 初始数据) {
  log(`[管道] 建立: TCP接口=${TCP接口 ? '已建立' : '未建立'}`);
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
          log(`[管道 TCP->WS] 结束: 共${bytesCount} bytes`);
          break;
        }
        if (value && value.byteLength > 0) {
          bytesCount += value.byteLength;
          // 减少管道日志，每 64KB 才打印一次
          // if (bytesCount <= 65536 || bytesCount % 65536 === 0) {
          //   log(`[管道 TCP->WS] 读取: ${value.byteLength} bytes，累计: ${bytesCount} bytes`);
          // }
          
          // 尝试解析 HTTP 响应
          httpBuffer = 拼接字节数据(httpBuffer, value);
          try {
            const httpText = new TextDecoder().decode(httpBuffer);
            const headerEnd = httpText.indexOf('\r\n\r\n');
            if (headerEnd !== -1) {
              const headerText = httpText.slice(0, headerEnd);
              const firstLine = headerText.split('\r\n')[0];
              log(`[HTTP 响应] ${firstLine} (${bytesCount} bytes)`);
              httpBuffer = new Uint8Array(0); // 清空缓冲区
            }
          } catch (e) {
            // 忽略解析错误
          }
          
          try {
            await 服务端.send(value);
            // 减少管道日志，每 64KB 才打印一次
            // if (bytesCount <= 65536 || bytesCount % 65536 === 0) {
            //   log(`[管道 TCP->WS] 转发: ${value.byteLength} bytes，累计: ${bytesCount} bytes`);
            // }
          } catch (e) {
            console.error(`[管道 TCP->WS] 发送失败: ${e.message}`);
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
  const forwardWSToTCP = async () => {
    const writer = TCP接口.writable.getWriter();
    try {
      if (初始数据 && 初始数据.byteLength > 0) {
        log(`[管道 WS->TCP] 写入初始数据: ${初始数据.byteLength} bytes`);
        await writer.write(初始数据);
      }
    } catch (e) {
      console.error(`[管道 WS->TCP] 写入初始数据失败: ${e.message}`);
    } finally {
      try { writer.releaseLock(); } catch (e) { }
    }
  };

  // 先写入初始数据，确保完成后再监听消息
  await forwardWSToTCP();

  服务端.addEventListener('close', () => {
    log(`[管道] 客户端关闭`);
    try { TCP接口.close(); } catch (e) { }
  });
  服务端.addEventListener('error', () => {
    log(`[管道] 客户端错误`);
    try { TCP接口.close(); } catch (e) { }
  });

  // 启动 TCP -> WS 转发
  forwardTCPToWS();
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
