import { connect } from 'cloudflare:sockets';
import { 共享状态 } from '../共享状态.js';
import { 获取或初始化UUID } from './节点配置.js';

// ====================== WebSocket处理 ======================
export async function 升级请求(请求, env) {
  const 创建接口 = new WebSocketPair();
  const [客户端, 服务端] = Object.values(创建接口);
  服务端.accept();
  const uuid = await 获取或初始化UUID(env);
  const 结果 = await 解析头(解密(请求.headers.get('sec-websocket-protocol')), env, uuid);
  if (!结果) return new Response('Invalid request', { status: 400 });
  const { TCP接口, 初始数据 } = 结果;
  建立管道(服务端, TCP接口, 初始数据);
  return new Response(null, { status: 101, webSocket: 客户端 });
}

function 解密(混淆字符) {
  混淆字符 = 混淆字符.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(混淆字符), c => c.charCodeAt(0)).buffer;
}

async function 解析头(数据, env, uuid) {
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
      const 地址长度 = 数据数组[地址信息索引];
      地址 = new TextDecoder().decode(数据.slice(地址信息索引 + 1, 地址信息索引 + 1 + 地址长度));
      break;
    case 3:
      地址 = Array.from({ length: 8 }, (_, i) => new DataView(数据.slice(地址信息索引, 地址信息索引 + 16)).getUint16(i * 2).toString(16)).join(':');
      break;
    default: return null;
  }

  const 初始数据 = 数据.slice(地址信息索引 + (地址类型 === 2 ? 数据数组[地址信息索引] + 1 : 地址类型 === 1 ? 4 : 16));
  const TCP接口 = await 智能连接(地址, 端口, 地址类型, env);
  return { TCP接口, 初始数据 };
}

async function 智能连接(地址, 端口, 地址类型, env) {
  const 当前反代地址 = env.PROXYIP || 共享状态.反代地址;
  const SOCKS5账号 = env.SOCKS5 || '';

  if (!地址 || 地址.trim() === '') {
    return await 尝试直连(地址, 端口);
  }

  const 是域名 = 地址类型 === 2 && !地址.match(/^\d+\.\d+\.\d+\.\d+$/);
  const 是IP = 地址类型 === 1 || (地址类型 === 2 && 地址.match(/^\d+\.\d+\.\d+\.\d+$/)) || 地址类型 === 3;

  if (是域名 || 是IP) {
    const 代理启用 = await env.KV数据库.get('proxyEnabled') === 'true';
    const 强制代理 = await env.KV数据库.get('forceProxy') === 'true';
    const 代理类型 = await env.KV数据库.get('proxyType') || 'reverse';

    if (!代理启用) {
      return await 尝试直连(地址, 端口);
    }

    if (强制代理) {
        if (代理类型 === 'reverse' && 当前反代地址) {
          try {
            const [反代主机, 反代端口] = 当前反代地址.split(':');
            const 连接 = connect({ hostname: 反代主机, port: 反代端口 || 端口 });
            await 连接.opened;
            console.log(`强制通过反代连接: ${当前反代地址}`);
            return 连接;
          } catch (错误) {
            console.error(`强制反代连接失败: ${错误.message}`);
            throw new Error(`强制反代失败: ${错误.message}`);
          }
        } else if (代理类型 === 'socks5' && SOCKS5账号) {
        try {
          const SOCKS5连接 = await 创建SOCKS5(地址类型, 地址, 端口);
          console.log(`强制通过 SOCKS5 连接: ${地址}:${端口}`);
          return SOCKS5连接;
        } catch (错误) {
          console.error(`强制 SOCKS5 连接失败: ${错误.message}`);
          throw new Error(`强制 SOCKS5 失败: ${错误.message}`);
        }
      }
    } else {
      try {
        const 连接 = await 尝试直连(地址, 端口);
        return 连接;
      } catch (错误) {
        console.log(`直连失败，动态切换到代理: ${错误.message}`);
        if (代理类型 === 'reverse' && 当前反代地址) {
          try {
            const [反代主机, 反代端口] = 当前反代地址.split(':');
            const 连接 = connect({ hostname: 反代主机, port: 反代端口 || 端口 });
            await 连接.opened;
            console.log(`动态通过反代连接: ${当前反代地址}`);
            return 连接;
          } catch (错误) {
            console.error(`动态反代连接失败: ${错误.message}`);
          }
        } else if (代理类型 === 'socks5' && SOCKS5账号) {
          try {
            const SOCKS5连接 = await 创建SOCKS5(地址类型, 地址, 端口, SOCKS5账号);
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

  return await 尝试直连(地址, 端口);
}

async function 尝试直连(地址, 端口) {
  try {
    const 连接 = connect({ hostname: 地址, port: 端口 });
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

async function 创建SOCKS5(地址类型, 地址, 端口, socks5账号 = null) {
  const 使用的SOCKS5账号 = socks5账号 || 共享状态.SOCKS5账号;
  const { username, password, hostname, port } = await 解析SOCKS5账号(使用的SOCKS5账号);
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
