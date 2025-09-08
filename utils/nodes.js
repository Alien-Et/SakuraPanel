// 节点管理模块

/**
 * 获取或初始化 UUID
 * @param {Object} env - Cloudflare Workers 环境对象
 * @returns {Promise<string>} UUID 字符串
 */
export async function getOrInitializeUUID(env) {
  let uuid = await env.KV数据库.get('current_uuid');
  if (!uuid) {
    uuid = generateUUID();
    await env.KV数据库.put('current_uuid', uuid);
  }
  return uuid;
}

/**
 * 生成 UUID
 * @returns {string} UUID 字符串
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 加载节点和配置
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} hostName - 主机名
 * @param {Array} preferredNodes - 优选节点数组（引用）
 * @param {string} nodeName - 节点名称
 * @returns {Promise<void>}
 */
export async function loadNodesAndConfig(env, hostName, preferredNodes, nodeName) {
  try {
    const nodePathsCache = await env.KV数据库.get('node_file_paths');
    let nodeFilePaths = nodePathsCache 
      ? JSON.parse(nodePathsCache) 
      : ['https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt', 'https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt'];

    const manualNodesCache = await env.KV数据库.get('manual_preferred_ips');
    let manualNodeList = [];
    if (manualNodesCache) {
      manualNodeList = JSON.parse(manualNodesCache).map(line => line.trim()).filter(Boolean);
    }

    const responseList = await Promise.all(
      nodeFilePaths.map(async (路径) => {
        try {
          const response = await fetch(路径);
          if (!response.ok) throw new Error(`请求 ${路径} 失败，状态码: ${response.status}`);
          const text = await response.text();
          return text.split('\n').map(line => line.trim()).filter(Boolean);
        } catch (错误) {
          console.error(`拉取 ${路径} 失败: ${错误.message}`);
          return [];
        }
      })
    );

    const domainNodeList = [...new Set(responseList.flat())];
    const mergedNodeList = [...new Set([...manualNodeList, ...domainNodeList])];
    const cachedNodes = await env.KV数据库.get('ip_preferred_ips');
    const currentNodeList = cachedNodes ? JSON.parse(cachedNodes) : [];
    const listsAreSame = JSON.stringify(mergedNodeList) === JSON.stringify(currentNodeList);

    if (mergedNodeList.length > 0) {
      // 更新引用数组
      preferredNodes.length = 0;
      mergedNodeList.forEach(node => preferredNodes.push(node));
      
      if (!listsAreSame) {
        const newVersion = String(Date.now());
        await env.KV数据库.put('ip_preferred_ips', JSON.stringify(mergedNodeList));
        await env.KV数据库.put('ip_preferred_ips_version', newVersion);
        // 注意：这里不直接调用 generateCatConfig 和 generateUniversalConfig，而是让调用者处理
      }
    } else {
      // 更新引用数组
      preferredNodes.length = 0;
      (currentNodeList.length > 0 ? currentNodeList : [`${hostName}:443`]).forEach(node => preferredNodes.push(node));
    }

    await env.KV数据库.put('node_file_paths', JSON.stringify(nodeFilePaths));
  } catch (错误) {
    const cachedNodes = await env.KV数据库.get('ip_preferred_ips');
    // 更新引用数组
    preferredNodes.length = 0;
    (cachedNodes ? JSON.parse(cachedNodes) : [`${hostName}:443`]).forEach(node => preferredNodes.push(node));
    await env.KV数据库.put('ip_error_log', JSON.stringify({ time: Date.now(), error: '所有路径拉取失败或手动上传为空' }), { expirationTtl: 86400 });
  }
}

/**
 * 获取配置
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} type - 配置类型
 * @param {string} hostName - 主机名
 * @param {Function} generateConfigFunction - 生成配置的函数
 * @returns {Promise<string>} 配置内容
 */
export async function getConfig(env, type, hostName, generateConfigFunction) {
  const cacheKey = type === atob('Y2xhc2g=') ? 'config_' + atob('Y2xhc2g=') : 'config_' + atob('djJyYXk=');
  const versionKey = `${cacheKey}_version`;
  const cachedConfig = await env.KV数据库.get(cacheKey);
  const configVersion = await env.KV数据库.get(versionKey) || '0';
  const nodeVersion = await env.KV数据库.get('ip_preferred_ips_version') || '0';

  if (cachedConfig && configVersion === nodeVersion) {
    return cachedConfig;
  }

  const newConfig = await generateConfigFunction(env, hostName);
  await env.KV数据库.put(cacheKey, newConfig);
  await env.KV数据库.put(versionKey, nodeVersion);
  return newConfig;
}