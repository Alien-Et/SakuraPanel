// 节点管理工具模块

// UUID缓存
let uuidCache = null;
let uuidCacheTime = 0;
const UUID_CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 获取或初始化UUID
 * @param {Object} env - Cloudflare Workers 环境对象
 * @returns {Promise<string>} UUID
 */
export async function getOrInitializeUUID(env) {
  // 检查缓存
  const now = Date.now();
  if (uuidCache && (now - uuidCacheTime) < UUID_CACHE_DURATION) {
    return uuidCache;
  }
  
  try {
    // 尝试从KV获取UUID
    let uuid = await env.KV数据库.get('uuid');
    
    if (!uuid) {
      // 如果KV中没有UUID，则生成一个新的
      uuid = crypto.randomUUID();
      await env.KV数据库.put('uuid', uuid);
    }
    
    // 更新缓存
    uuidCache = uuid;
    uuidCacheTime = now;
    
    return uuid;
  } catch (error) {
    console.error('获取或初始化UUID失败:', error);
    // 如果KV不可用，生成临时UUID
    const tempUUID = crypto.randomUUID();
    uuidCache = tempUUID;
    uuidCacheTime = now;
    return tempUUID;
  }
}

// 节点和配置缓存
let nodesCache = null;
let configCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 加载节点和配置
 * @param {Object} env - Cloudflare Workers 环境对象
 * @returns {Promise<Object>} 节点列表和配置
 */
export async function loadNodesAndConfig(env) {
  // 检查缓存
  const now = Date.now();
  if (nodesCache && configCache && (now - cacheTime) < CACHE_DURATION) {
    return { nodes: nodesCache, config: configCache };
  }
  
  try {
    // 获取节点文件路径列表
    const nodeFiles = await env.KV数据库.get('node_files');
    const filePaths = nodeFiles ? JSON.parse(nodeFiles) : [];
    
    // 获取手动添加的节点
    const manualNodesData = await env.KV数据库.get('manual_nodes');
    const manualNodes = manualNodesData ? JSON.parse(manualNodesData) : [];
    
    let allNodes = [...manualNodes];
    
    // 从文件路径加载节点
    for (const filePath of filePaths) {
      try {
        const fileContent = await env.KV数据库.get(filePath);
        if (fileContent) {
          const lines = fileContent.split('\n');
          const nodes = lines
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));
          allNodes = [...allNodes, ...nodes];
        }
      } catch (error) {
        console.error(`加载节点文件失败 ${filePath}:`, error);
      }
    }
    
    // 去重并过滤空行
    allNodes = [...new Set(allNodes)].filter(node => node.trim() !== '');
    
    // 生成配置
    const config = generateConfig(allNodes);
    
    // 更新缓存
    nodesCache = allNodes;
    configCache = config;
    cacheTime = now;
    
    return { nodes: allNodes, config };
  } catch (error) {
    console.error('加载节点和配置失败:', error);
    return { nodes: [], config: {} };
  }
}

/**
 * 从URL列表获取节点
 * @param {Array<string>} urls - URL列表
 * @returns {Promise<Array<string>>} 节点列表
 */
export async function fetchNodeList(urls) {
  const allNodes = [];
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const content = await response.text();
        // 尝试解析为JSON
        try {
          const data = JSON.parse(content);
          if (Array.isArray(data)) {
            allNodes.push(...data);
          } else if (typeof data === 'object' && data.nodeList) {
            allNodes.push(...data.nodeList);
          }
        } catch {
          // 如果不是JSON，按行分割
          const lines = content.split('\n');
          const nodes = lines
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));
          allNodes.push(...nodes);
        }
      }
    } catch (error) {
      console.error(`获取节点失败 ${url}:`, error);
    }
  }
  
  // 去重
  return [...new Set(allNodes)].filter(node => node.trim() !== '');
}

/**
 * 获取配置（带版本控制）
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {Array<string>} nodes - 节点列表
 * @returns {Promise<Object>} 配置对象
 */
export async function getConfig(env, nodes) {
  try {
    // 获取当前版本
    const currentVersion = await env.KV数据库.get('config_version');
    const version = currentVersion ? parseInt(currentVersion) : 0;
    
    // 生成配置
    const config = generateConfig(nodes);
    
    return {
      ...config,
      version
    };
  } catch (error) {
    console.error('获取配置失败:', error);
    return {};
  }
}

/**
 * 生成配置
 * @param {Array<string>} nodes - 节点列表
 * @returns {Object} 配置对象
 */
function generateConfig(nodes) {
  // 实现配置生成逻辑
  // 生成节点配置
  const nodeConfigs = nodes.map(node => {
    // 解析节点信息
    let nodeName = node;
    let remark = '';
    
    if (node.includes('|')) {
      const parts = node.split('|');
      nodeName = parts[0];
      if (parts.length > 1) {
        remark = parts[1];
      }
    }
    
    // 过滤无效节点
    if (!nodeName || !nodeName.includes(':')) {
      return null;
    }
    
    const nodeInfo = nodeName.split(':');
    const nodeHost = nodeInfo[0];
    const nodePort = parseInt(nodeInfo[1]) || 443;
    
    return {
      host: nodeHost,
      port: nodePort,
      remark: remark || '节点',
      nodeName: nodeName
    };
  }).filter(Boolean);
  
  return {
    nodes: nodeConfigs,
    rawNodes: nodes,
    generatedAt: new Date().toISOString()
  };
}

/**
 * 存储IP列表
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {Array<string>} ips - IP列表
 * @returns {Promise<boolean>} 是否成功存储
 */
export async function storeIpList(env, ips) {
  try {
    await env.KV数据库.put('ip_preferred_ips', JSON.stringify(ips));
    return true;
  } catch (error) {
    console.error('存储IP列表失败:', error);
    return false;
  }
}

/**
 * 获取配置版本
 * @param {Object} env - Cloudflare Workers 环境对象
 * @returns {Promise<number>} 配置版本
 */
export async function getConfigVersion(env) {
  try {
    const version = await env.KV数据库.get('config_version');
    return version ? parseInt(version) : 0;
  } catch (error) {
    console.error('获取配置版本失败:', error);
    return 0;
  }
}

/**
 * 更新配置版本
 * @param {Object} env - Cloudflare Workers 环境对象
 * @returns {Promise<number>} 更新后的配置版本
 */
export async function updateConfigVersion(env) {
  try {
    const currentVersion = await getConfigVersion(env);
    const newVersion = currentVersion + 1;
    await env.KV数据库.put('config_version', newVersion.toString());
    return newVersion;
  } catch (error) {
    console.error('更新配置版本失败:', error);
    return 0;
  }
}

/**
 * 添加节点路径
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} path - 节点路径
 * @returns {Promise<boolean>} 是否成功添加
 */
export async function addNodePath(env, path) {
  try {
    // 获取现有节点路径列表
    const nodeFiles = await env.KV数据库.get('node_files');
    const filePaths = nodeFiles ? JSON.parse(nodeFiles) : [];
    
    // 添加新路径
    if (!filePaths.includes(path)) {
      filePaths.push(path);
      await env.KV数据库.put('node_files', JSON.stringify(filePaths));
    }
    
    return true;
  } catch (error) {
    console.error('添加节点路径失败:', error);
    return false;
  }
}

/**
 * 移除节点路径
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {number} index - 路径索引
 * @returns {Promise<boolean>} 是否成功移除
 */
export async function removeNodePath(env, index) {
  try {
    // 获取现有节点路径列表
    const nodeFiles = await env.KV数据库.get('node_files');
    const filePaths = nodeFiles ? JSON.parse(nodeFiles) : [];
    
    // 检查索引是否有效
    if (index < 0 || index >= filePaths.length) {
      return false;
    }
    
    // 移除指定索引的路径
    filePaths.splice(index, 1);
    await env.KV数据库.put('node_files', JSON.stringify(filePaths));
    
    return true;
  } catch (error) {
    console.error('移除节点路径失败:', error);
    return false;
  }
}

/**
 * 获取节点路径列表
 * @param {Object} env - Cloudflare Workers 环境对象
 * @returns {Promise<Array<string>>} 节点路径列表
 */
export async function getNodePaths(env) {
  try {
    const nodeFiles = await env.KV数据库.get('node_files');
    return nodeFiles ? JSON.parse(nodeFiles) : [];
  } catch (error) {
    console.error('获取节点路径列表失败:', error);
    return [];
  }
}

/**
 * 设置代理状态
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {boolean} enabled - 是否启用代理
 * @param {boolean} forceProxy - 是否强制代理
 * @param {string} proxyType - 代理类型
 * @returns {Promise<boolean>} 是否成功设置
 */
export async function setProxyState(env, enabled, forceProxy, proxyType) {
  try {
    const proxyState = {
      enabled,
      forceProxy,
      proxyType,
      updatedAt: new Date().toISOString()
    };
    
    await env.KV数据库.put('proxy_state', JSON.stringify(proxyState));
    return true;
  } catch (error) {
    console.error('设置代理状态失败:', error);
    return false;
  }
}

/**
 * 获取代理状态
 * @param {Object} env - Cloudflare Workers 环境对象
 * @returns {Promise<Object>} 代理状态对象
 */
export async function getProxyState(env) {
  try {
    const proxyState = await env.KV数据库.get('proxy_state');
    return proxyState ? JSON.parse(proxyState) : {
      enabled: false,
      forceProxy: false,
      proxyType: 'reverse',
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('获取代理状态失败:', error);
    return {
      enabled: false,
      forceProxy: false,
      proxyType: 'reverse',
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * 添加手动节点
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} node - 节点信息
 * @returns {Promise<boolean>} 是否成功添加
 */
export async function addManualNode(env, node) {
  try {
    // 获取现有手动节点列表
    const manualNodesData = await env.KV数据库.get('manual_nodes');
    const manualNodes = manualNodesData ? JSON.parse(manualNodesData) : [];
    
    // 添加新节点
    if (!manualNodes.includes(node)) {
      manualNodes.push(node);
      await env.KV数据库.put('manual_nodes', JSON.stringify(manualNodes));
    }
    
    return true;
  } catch (error) {
    console.error('添加手动节点失败:', error);
    return false;
  }
}

/**
 * 移除手动节点
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} node - 节点信息
 * @returns {Promise<boolean>} 是否成功移除
 */
export async function removeManualNode(env, node) {
  try {
    // 获取现有手动节点列表
    const manualNodesData = await env.KV数据库.get('manual_nodes');
    const manualNodes = manualNodesData ? JSON.parse(manualNodesData) : [];
    
    // 查找并移除节点
    const index = manualNodes.indexOf(node);
    if (index !== -1) {
      manualNodes.splice(index, 1);
      await env.KV数据库.put('manual_nodes', JSON.stringify(manualNodes));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('移除手动节点失败:', error);
    return false;
  }
}

/**
 * 获取手动节点列表
 * @param {Object} env - Cloudflare Workers 环境对象
 * @returns {Promise<Array<string>>} 手动节点列表
 */
export async function getManualNodes(env) {
  try {
    const manualNodesData = await env.KV数据库.get('manual_nodes');
    return manualNodesData ? JSON.parse(manualNodesData) : [];
  } catch (error) {
    console.error('获取手动节点列表失败:', error);
    return [];
  }
}

/**
 * 获取IP列表
 * @param {Object} env - Cloudflare Workers 环境对象
 * @returns {Promise<Array<string>>} IP列表
 */
export async function getIpList(env) {
  try {
    const ipList = await env.KV数据库.get('ip_preferred_ips');
    return ipList ? JSON.parse(ipList) : [];
  } catch (error) {
    console.error('获取IP列表失败:', error);
    return [];
  }
}

/**
 * 添加IP到列表
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} ip - IP地址
 * @returns {Promise<boolean>} 是否成功添加
 */
export async function addIpToList(env, ip) {
  try {
    // 获取现有IP列表
    const ipList = await getIpList(env);
    
    // 添加新IP
    if (!ipList.includes(ip)) {
      ipList.push(ip);
      await env.KV数据库.put('ip_preferred_ips', JSON.stringify(ipList));
    }
    
    return true;
  } catch (error) {
    console.error('添加IP到列表失败:', error);
    return false;
  }
}

/**
 * 从列表中移除IP
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} ip - IP地址
 * @returns {Promise<boolean>} 是否成功移除
 */
export async function removeIpFromList(env, ip) {
  try {
    // 获取现有IP列表
    const ipList = await getIpList(env);
    
    // 查找并移除IP
    const index = ipList.indexOf(ip);
    if (index !== -1) {
      ipList.splice(index, 1);
      await env.KV数据库.put('ip_preferred_ips', JSON.stringify(ipList));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('从列表中移除IP失败:', error);
    return false;
  }
}

/**
 * 获取节点配置
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} uuid - UUID
 * @returns {Promise<Object>} 节点配置
 */
export async function getNodeConfig(env, uuid) {
  try {
    const configKey = `node_config_${uuid}`;
    const config = await env.KV数据库.get(configKey);
    return config ? JSON.parse(config) : {
      uuid,
      nodes: [],
      rawNodes: [],
      generatedAt: new Date().toISOString(),
      version: 0
    };
  } catch (error) {
    console.error('获取节点配置失败:', error);
    return {
      uuid,
      nodes: [],
      rawNodes: [],
      generatedAt: new Date().toISOString(),
      version: 0
    };
  }
}

/**
 * 保存节点配置
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} uuid - UUID
 * @param {Object} config - 节点配置
 * @returns {Promise<boolean>} 是否成功保存
 */
export async function saveNodeConfig(env, uuid, config) {
  try {
    const configKey = `node_config_${uuid}`;
    await env.KV数据库.put(configKey, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('保存节点配置失败:', error);
    return false;
  }
}

/**
 * 获取用户设置
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} uuid - UUID
 * @returns {Promise<Object>} 用户设置
 */
export async function getUserSettings(env, uuid) {
  try {
    const settingsKey = `user_settings_${uuid}`;
    const settings = await env.KV数据库.get(settingsKey);
    return settings ? JSON.parse(settings) : {
      uuid,
      theme: 'light',
      backgroundImage: '',
      proxyEnabled: false,
      forceProxy: false,
      proxyType: 'reverse',
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('获取用户设置失败:', error);
    return {
      uuid,
      theme: 'light',
      backgroundImage: '',
      proxyEnabled: false,
      forceProxy: false,
      proxyType: 'reverse',
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * 保存用户设置
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} uuid - UUID
 * @param {Object} settings - 用户设置
 * @returns {Promise<boolean>} 是否成功保存
 */
export async function saveUserSettings(env, uuid, settings) {
  try {
    const settingsKey = `user_settings_${uuid}`;
    settings.updatedAt = new Date().toISOString();
    await env.KV数据库.put(settingsKey, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('保存用户设置失败:', error);
    return false;
  }
}