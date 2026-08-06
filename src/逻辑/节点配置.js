import { 共享状态 } from '../共享状态.js';
import { 默认白天背景图, 默认暗黑背景图 } from '../常量.js';
import { 生成UUID, 解析节点, D1获取, D1设置, D1批量获取, error } from './辅助函数.js';

// ====================== 节点配置相关 ======================
export async function 获取或初始化UUID(env) {
  let uuid = await D1获取(env, 'current_uuid');
  if (!uuid) {
    uuid = 生成UUID();
    await D1设置(env, 'current_uuid', uuid);
  }
  return uuid;
}

async function 获取壁纸地址(env) {
  const wallpapers = await D1批量获取(env, ['custom_light_bg', 'custom_dark_bg']);
  const 白天壁纸 = wallpapers.custom_light_bg;
  const 暗黑壁纸 = wallpapers.custom_dark_bg;

  return {
    白天: 白天壁纸 || 默认白天背景图,
    暗黑: 暗黑壁纸 || 默认暗黑背景图
  };
}

export async function 加载节点和配置(env, hostName) {
  try {
    const 节点路径缓存 = await D1获取(env, 'node_file_paths');
    let 节点文件路径 = 节点路径缓存
      ? JSON.parse(节点路径缓存)
      : ['https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt', 'https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt'];

    const 手动节点缓存 = await D1获取(env, 'manual_preferred_ips');
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
          error(`拉取 ${路径} 失败: ${错误.message}`);
          return [];
        }
      })
    );

    const 域名节点列表 = [...new Set(响应列表.flat())];
    // 按 地址:端口 去重：URL节点先入，手动节点仅在更完整时覆盖（避免不完整的手动节点丢失URL的名称/TLS）
    const 节点完整度 = (解析, 原始) => (解析.名称 ? 2 : 0) + (原始.includes('@') ? 1 : 0);
    const 节点Map = new Map();
    for (const 节点 of 域名节点列表) {
      const 解析 = 解析节点(节点);
      if (解析 && !节点Map.has(解析.去重键)) 节点Map.set(解析.去重键, 节点);
    }
    for (const 节点 of 手动节点列表) {
      const 解析 = 解析节点(节点);
      if (!解析) continue;
      const 已有 = 节点Map.get(解析.去重键);
      if (!已有 || 节点完整度(解析, 节点) >= 节点完整度(解析节点(已有), 已有)) {
        节点Map.set(解析.去重键, 节点);
      }
    }
    const 合并节点列表 = [...节点Map.values()];

    // 实时拉取，不缓存节点列表；拉取为空时用主机兜底
    共享状态.优选节点 = 合并节点列表.length > 0 ? 合并节点列表 : [`${hostName}:443`];

    await D1设置(env, 'node_file_paths', JSON.stringify(节点文件路径));
  } catch (错误) {
    共享状态.优选节点 = [`${hostName}:443`];
  }
}
