// ====================== 辅助函数 ======================
import { 共享状态 } from '../共享状态.js';
// 通用常量
export const 默认节点路径 = [
  'https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt',
  'https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt'
];

export const 配置路径映射 = {
  魔法1: atob('Y2xhc2g='),
  魔法2: atob('djJyYXluZw=='),
  魔法3: atob('c2luZ2JveA==')
};

// 日志分级：off=关闭, error=仅错误, info=仅正常, all=全量
export function log(...args) {
  if (共享状态.日志级别 === 'all' || 共享状态.日志级别 === 'info') {
    console.log(...args);
  }
}

export function error(...args) {
  if (共享状态.日志级别 === 'all' || 共享状态.日志级别 === 'error') {
    console.error(...args);
  }
}

// 安全获取 Cookie 值
export function 获取Cookie值(请求, 名称) {
  const cookieHeader = 请求.headers.get('Cookie') || '';
  const cookies = cookieHeader.split(';').map(c => c.trim().split('='));
  for (const [key, value] of cookies) {
    if (key === 名称) return value;
  }
  return null;
}

// 统一验证请求 Token
export async function 验证请求Token(请求, env) {
  const token = 获取Cookie值(请求, 'token');
  const 有效Token = await D1获取(env, 'current_token');
  return token && token === 有效Token;
}

// 统一获取表单数据
export async function 获取表单数据(请求) {
  try {
    return await 请求.formData();
  } catch {
    return null;
  }
}

export function 创建HTML响应(内容, 状态码 = 200) {
  return new Response(内容, {
    status: 状态码,
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
    }
  });
}

export function 创建重定向响应(路径, 额外头 = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": 路径,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...额外头
    }
  });
}

export function 创建JSON响应(数据, 状态码 = 200, 额外头 = {}) {
  return new Response(JSON.stringify(数据), {
    status: 状态码,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...额外头
    }
  });
}

export function 生成UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function 加密密码(密码) {
  const encoder = new TextEncoder();
  const data = encoder.encode(密码);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 从UA提取粗粒度设备指纹（浏览器主版本+操作系统类别），
// 既能区分不同设备避免NAT下同IP误锁，又避免完整UA细微差异导致计数key过多
export function 提取设备指纹(UA) {
  const ua = UA || '';
  let 浏览器 = 'other';
  let m;
  if ((m = /Edg(?:e|A|iOS)?\/(\d+)/.exec(ua))) 浏览器 = 'edge' + m[1];
  else if ((m = /Chrome\/(\d+)/.exec(ua))) 浏览器 = 'chrome' + m[1];
  else if ((m = /(?:Firefox|FxIOS)\/(\d+)/.exec(ua))) 浏览器 = 'firefox' + m[1];
  else if ((m = /Version\/(\d+).*Safari/.exec(ua))) 浏览器 = 'safari' + m[1];

  let 系统 = 'other';
  if (/Windows/.test(ua)) 系统 = 'win';
  else if (/Android/.test(ua)) 系统 = 'android';
  else if (/iPhone|iPad|iPod/.test(ua)) 系统 = 'ios';
  else if (/Mac OS X/.test(ua)) 系统 = 'mac';
  else if (/Linux/.test(ua)) 系统 = 'linux';

  return 浏览器 + '_' + 系统;
}

// 统一解析节点字符串，提取地址/端口/名称/tls，生成去重键
// 支持格式：[IPv6]:端口#名称@tls / IPv4:端口#名称@tls / 域名#名称 / 纯地址 等
// 去重键 = 地址小写:端口 （IPv6去括号、域名/IP统一小写、端口缺省：tls=443, notls=80）
export function 解析节点(节点字符串) {
  const line = (节点字符串 || '').trim();
  if (!line) return null;
  const [主内容, tls = 'tls'] = line.split('@');
  const [地址端口, 名称] = 主内容.split('#');
  let 地址 = '';
  let 端口 = '';
  const 默认端口 = tls === 'notls' ? '80' : '443';
  // IPv6：[::1]:port 或 [::1]
  const v6 = 地址端口.match(/^\[([0-9a-fA-F:]+)\](?::(\d+))?$/);
  // IPv4/域名：addr:port 或 addr
  const other = 地址端口.match(/^([^:]+)(?::(\d+))?$/);
  if (v6) {
    地址 = v6[1];
    端口 = v6[2] || 默认端口;
  } else if (other) {
    地址 = other[1];
    端口 = other[2] || 默认端口;
  } else {
    return null;
  }
  const 去重键 = 地址.toLowerCase() + ':' + 端口;
  return { 地址, 端口, 名称: 名称 || '', tls, 去重键, 原始: line };
}

export async function 检查锁定(env, 设备标识) {
  const 锁定时间戳 = await D1获取(env, `lock_${设备标识}`);
  const 当前时间 = Date.now();
  const 被锁定 = 锁定时间戳 && 当前时间 < Number(锁定时间戳);
  return {
    被锁定,
    剩余时间: 被锁定 ? Math.ceil((Number(锁定时间戳) - 当前时间) / 1000) : 0
  };
}

// 生成订阅Token：SHA-256(hostName + uuid)
export async function 生成订阅Token(hostName, uuid) {
  return await 加密密码(hostName + uuid);
}

// 验证订阅请求的Token
export async function 验证订阅Token(env, hostName, url) {
  const tokenEnabled = await D1获取(env, 'subTokenEnabled') !== 'false';
  if (!tokenEnabled) return true;
  const uuid = await D1获取(env, 'current_uuid');
  if (!uuid) return false;
  const 期望Token = await 生成订阅Token(hostName, uuid);
  const 请求Token = url.searchParams.get('token');
  return 请求Token === 期望Token;
}

// ====================== D1 数据库辅助函数 ======================
export async function D1获取(env, key) {
  const row = await env.D1DB.prepare('SELECT value, expires_at FROM settings WHERE key = ?').bind(key).first();
  if (!row) return null;
  if (row.expires_at && Date.now() > row.expires_at) {
    await env.D1DB.prepare('DELETE FROM settings WHERE key = ?').bind(key).run();
    return null;
  }
  return row.value;
}

export async function D1设置(env, key, value, ttl秒数) {
  const expires_at = ttl秒数 ? Date.now() + ttl秒数 * 1000 : null;
  await env.D1DB.prepare('INSERT OR REPLACE INTO settings (key, value, expires_at) VALUES (?, ?, ?)').bind(key, value, expires_at).run();
}

export async function D1删除(env, key) {
  await env.D1DB.prepare('DELETE FROM settings WHERE key = ?').bind(key).run();
}

export async function D1批量获取(env, keys) {
  if (!keys || keys.length === 0) return {};
  const placeholders = keys.map(() => '?').join(', ');
  const resultSet = await env.D1DB.prepare(
    `SELECT key, value, expires_at FROM settings WHERE key IN (${placeholders})`
  ).bind(...keys).all();

  const rows = resultSet.results || [];
  const result = {};
  const now = Date.now();
  const toDelete = [];

  for (const row of rows) {
    if (row.expires_at && now > row.expires_at) {
      toDelete.push(row.key);
      continue;
    }
    result[row.key] = row.value;
  }

  if (toDelete.length > 0) {
    const deletePlaceholders = toDelete.map(() => '?').join(', ');
    await env.D1DB.prepare(
      `DELETE FROM settings WHERE key IN (${deletePlaceholders})`
    ).bind(...toDelete).run();
  }

  for (const key of keys) {
    if (!(key in result)) {
      result[key] = null;
    }
  }

  return result;
}

export async function D1初始化(env) {
  await env.D1DB.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT, expires_at INTEGER)`);
}

// 查询Cloudflare Workers/Pages当日请求量
export async function 查询CF请求数(env) {
  const credentials = await D1批量获取(env, ['cf_account_id', 'cf_api_token', 'cf_email', 'cf_global_api_key']);
  const accountId = credentials.cf_account_id || '';
  const apiToken = credentials.cf_api_token || '';
  const email = credentials.cf_email || '';
  const globalApiKey = credentials.cf_global_api_key || '';
  // 至少需要一种认证方式
  const hasToken = accountId && apiToken;
  const hasEmailKey = email && globalApiKey;
  if (!hasToken && !hasEmailKey) return { success: false, pages: 0, workers: 0, total: 0, max: 100000 };

  // 检查缓存（5分钟）
  const 缓存 = await D1获取(env, 'cf_usage_cache');
  if (缓存) {
    const 数据 = JSON.parse(缓存);
    if (Date.now() - 数据.时间戳 < 300000) return 数据.用量;
  }

  try {
    const API = 'https://api.cloudflare.com/client/v4';
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    const cfg = { 'Content-Type': 'application/json' };

    // 构建认证头
    let hdr;
    let finalAccountId = accountId;
    if (apiToken) {
      hdr = { ...cfg, 'Authorization': `Bearer ${apiToken}` };
    } else {
      hdr = { ...cfg, 'X-AUTH-EMAIL': email, 'X-AUTH-KEY': globalApiKey };
    }

    // 如果没有 Account ID，用邮箱+API Key 查询
    if (!finalAccountId && hasEmailKey) {
      const 响应 = await fetch(`${API}/accounts`, { method: 'GET', headers: hdr });
      if (!响应.ok) throw new Error(`账户获取失败: HTTP ${响应.status}`);
      const 数据 = await 响应.json();
      if (!数据?.result?.length) throw new Error('未找到账户');
      finalAccountId = 数据.result[0]?.id;
    }

    if (!finalAccountId) throw new Error('无法确定Account ID');

    const res = await fetch(`${API}/graphql`, {
      method: 'POST',
      headers: hdr,
      body: JSON.stringify({
        query: `query getBillingMetrics($AccountID: String!, $filter: AccountWorkersInvocationsAdaptiveFilter_InputObject) {
          viewer { accounts(filter: {accountTag: $AccountID}) {
            pagesFunctionsInvocationsAdaptiveGroups(limit: 1000, filter: $filter) { sum { requests } }
            workersInvocationsAdaptive(limit: 10000, filter: $filter) { sum { requests } }
          } }
        }`,
        variables: { AccountID: finalAccountId, filter: { datetime_geq: now.toISOString(), datetime_leq: new Date().toISOString() } }
      })
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`CF API返回 HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }
    const result = await res.json();
    if (result.errors?.length) throw new Error(result.errors[0].message);
    const acc = result?.data?.viewer?.accounts?.[0];
    if (!acc) throw new Error('未找到账户数据');
    const sum = (a) => a?.reduce((t, i) => t + (i?.sum?.requests || 0), 0) || 0;
    const pages = sum(acc.pagesFunctionsInvocationsAdaptiveGroups);
    const workers = sum(acc.workersInvocationsAdaptive);
    const total = pages + workers;
    const 用量 = { success: true, pages, workers, total, max: 100000 };
    await D1设置(env, 'cf_usage_cache', JSON.stringify({ 时间戳: Date.now(), 用量 }), 300);
    return 用量;
  } catch (错误) {
    error('获取CF使用量错误:', 错误.message);
    return { success: false, pages: 0, workers: 0, total: 0, max: 100000, error: 错误.message };
  }
}

// 获取Subscription-Userinfo响应头（基于CF请求数）
// 请求统计根据是否填入CF凭证自动开启：有凭证则开启，无凭证则不开启
export async function 获取流量信息头(env) {
  const 用量 = await 查询CF请求数(env);
  if (!用量.success) return {};
  // 映射：Pages请求=upload，Workers请求=download，上限转字节
  const totalBytes = Math.floor((用量.max / 1000) * 1024);
  return { 'Subscription-Userinfo': `upload=${用量.pages}; download=${用量.workers}; total=${totalBytes}; expire=4102329600` };
}
