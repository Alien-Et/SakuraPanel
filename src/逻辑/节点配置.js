import { 共享状态 } from '../共享状态.js';
import { 默认白天背景图, 默认暗黑背景图 } from '../常量.js';
import { 生成UUID } from './辅助函数.js';
import { 生成猫咪, 生成通用 } from './配置生成器.js';

// ====================== 节点配置相关 ======================
export async function 获取或初始化UUID(env) {
  let uuid = await env.KV数据库.get('current_uuid');
  if (!uuid) {
    uuid = 生成UUID();
    await env.KV数据库.put('current_uuid', uuid);
  }
  return uuid;
}

async function 获取壁纸地址(env) {
  const 白天壁纸 = await env.KV数据库.get('custom_light_bg');
  const 暗黑壁纸 = await env.KV数据库.get('custom_dark_bg');

  return {
    白天: 白天壁纸 || 默认白天背景图,
    暗黑: 暗黑壁纸 || 默认暗黑背景图
  };
}

export async function 加载节点和配置(env, hostName) {
  try {
    const 节点路径缓存 = await env.KV数据库.get('node_file_paths');
    let 节点文件路径 = 节点路径缓存
      ? JSON.parse(节点路径缓存)
      : ['https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt', 'https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt'];

    const 手动节点缓存 = await env.KV数据库.get('manual_preferred_ips');
    let 手动节点列表 = [];
    if (手动节点缓存) {
      手动节点列表 = JSON.parse(手动节点缓存).map(line => line.trim()).filter(Boolean);
    }

    const 响应列表 = await Promise.all(
      节点文件路径.map(async (路径) => {
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
    const 缓存节点 = await env.KV数据库.get('ip_preferred_ips');
    const 当前节点列表 = 缓存节点 ? JSON.parse(缓存节点) : [];
    const 列表相同 = JSON.stringify(合并节点列表) === JSON.stringify(当前节点列表);

    if (合并节点列表.length > 0) {
      共享状态.优选节点 = 合并节点列表;
      if (!列表相同) {
        const 新版本 = String(Date.now());
        await env.KV数据库.put('ip_preferred_ips', JSON.stringify(合并节点列表));
        await env.KV数据库.put('ip_preferred_ips_version', 新版本);
        await env.KV数据库.put('config_' + atob('Y2xhc2g='), await 生成猫咪(env, hostName));
        await env.KV数据库.put('config_' + atob('Y2xhc2g=') + '_version', 新版本);
        await env.KV数据库.put('config_' + atob('djJyYXk='), await 生成通用(env, hostName));
        await env.KV数据库.put('config_' + atob('djJyYXk=') + '_version', 新版本);
      }
    } else {
      共享状态.优选节点 = 当前节点列表.length > 0 ? 当前节点列表 : [`${hostName}:443`];
    }

    await env.KV数据库.put('node_file_paths', JSON.stringify(节点文件路径));
  } catch (错误) {
    const 缓存节点 = await env.KV数据库.get('ip_preferred_ips');
    共享状态.优选节点 = 缓存节点 ? JSON.parse(缓存节点) : [`${hostName}:443`];
    await env.KV数据库.put('ip_error_log', JSON.stringify({ time: Date.now(), error: '所有路径拉取失败或手动上传为空' }), { expirationTtl: 86400 });
  }
}

export async function 获取配置(env, 类型, hostName) {
  const 缓存键 = 类型 === atob('Y2xhc2g=') ? 'config_' + atob('Y2xhc2g=') : 'config_' + atob('djJyYXk=');
  const 版本键 = `${缓存键}_version`;
  const 缓存配置 = await env.KV数据库.get(缓存键);
  const 配置版本 = await env.KV数据库.get(版本键) || '0';
  const 节点版本 = await env.KV数据库.get('ip_preferred_ips_version') || '0';

  if (缓存配置 && 配置版本 === 节点版本) {
    return 缓存配置;
  }

  const 新配置 = 类型 === atob('Y2xhc2g=') ? await 生成猫咪(env, hostName) : await 生成通用(env, hostName);
  await env.KV数据库.put(缓存键, 新配置);
  await env.KV数据库.put(版本键, 节点版本);
  return 新配置;
}
