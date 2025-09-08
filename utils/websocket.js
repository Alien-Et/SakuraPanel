// WebSocket 处理模块

/**
 * 处理 WebSocket 升级请求
 * @param {Request} request - 客户端请求对象
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} hostName - 主机名
 * @param {Array} preferredNodes - 优选节点数组
 * @returns {Promise<Response>} WebSocket 响应
 */
export async function handleWebSocketUpgrade(request, env, hostName, preferredNodes) {
  try {
    // 验证请求是否包含必要的认证信息
    const authHeader = request.headers.get('Authorization') || '';
    const uuid = await env.KV数据库.get('current_uuid');
    
    // 检查认证
    if (!authHeader.includes(uuid) && !isProxyRequestPath(request)) {
      // 尝试从 URL 参数中获取 UUID
      const url = new URL(request.url);
      if (!url.searchParams.get('uuid') || url.searchParams.get('uuid') !== uuid) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // 智能连接到节点
    const { conn, selectedNode } = await connectToNode(preferredNodes, hostName);
    
    if (!conn) {
      throw new Error('无法连接到任何节点');
    }

    // 创建服务器端 WebSocket
    const { socket, response } = Deno.upgradeWebSocket(request);
    
    // WebSocket 事件处理
    handleWebSocketEvents(socket, conn);

    console.log(`WebSocket 连接已建立到节点: ${selectedNode}`);
    return response;
  } catch (error) {
    console.error('WebSocket 升级失败:', error);
    return new Response('WebSocket 升级失败', { status: 500 });
  }
}

/**
 * 检查请求路径是否为代理路径
 * @param {Request} request - 客户端请求对象
 * @returns {boolean} 是否为代理路径
 */
function isProxyRequestPath(request) {
  const url = new URL(request.url);
  return url.pathname === '/ws' || url.pathname === '/socks5';
}

/**
 * 智能连接到节点
 * @param {Array} preferredNodes - 优选节点数组
 * @param {string} hostName - 主机名
 * @returns {Promise<{conn: WebSocket, selectedNode: string}>} 连接和选中的节点
 */
async function connectToNode(preferredNodes, hostName) {
  for (const node of [...preferredNodes, `${hostName}:443`]) {
    try {
      const nodeParts = node.split(':');
      const nodeHost = nodeParts[0];
      const nodePort = parseInt(nodeParts[1]) || 443;
      const wsUrl = `wss://${nodeHost}:${nodePort}/ws?ed=2048`;
      
      // 尝试连接到节点
      const conn = await new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => resolve(ws);
        ws.onerror = reject;
        ws.onclose = () => reject(new Error('连接关闭'));
        // 设置超时
        setTimeout(() => reject(new Error('连接超时')), 5000);
      });
      
      return { conn, selectedNode: node };
    } catch (error) {
      console.warn(`连接到节点 ${node} 失败: ${error.message}`);
      // 继续尝试下一个节点
    }
  }
  
  // 所有节点都连接失败
  throw new Error('所有节点连接失败');
}

/**
 * 处理 WebSocket 事件
 * @param {WebSocket} socket - 服务器端 WebSocket
 * @param {WebSocket} conn - 到目标节点的 WebSocket 连接
 */
function handleWebSocketEvents(socket, conn) {
  // 客户端消息 -> 目标节点
  socket.onmessage = event => {
    if (conn && conn.readyState === WebSocket.OPEN) {
      conn.send(event.data);
    }
  };
  
  // 目标节点消息 -> 客户端
  conn.onmessage = event => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(event.data);
    }
  };
  
  // 客户端关闭 -> 关闭目标节点连接
  socket.onclose = () => {
    if (conn && conn.readyState !== WebSocket.CLOSED) {
      conn.close();
    }
  };
  
  // 目标节点关闭 -> 关闭客户端连接
  conn.onclose = () => {
    if (socket.readyState !== WebSocket.CLOSED) {
      socket.close();
    }
  };
  
  // 错误处理
  socket.onerror = error => {
    console.error('客户端 WebSocket 错误:', error);
  };
  
  conn.onerror = error => {
    console.error('目标节点 WebSocket 错误:', error);
  };
}

/**
 * 处理 SOCKS5 连接
 * @param {Request} request - 客户端请求对象
 * @param {Object} env - Cloudflare Workers 环境对象
 * @param {string} hostName - 主机名
 * @returns {Promise<Response>} SOCKS5 连接响应
 */
export async function handleSocks5Connection(request, env, hostName) {
  try {
    // 解析账号和密码
    const authHeader = request.headers.get('Proxy-Authorization') || '';
    const uuid = await env.KV数据库.get('current_uuid');
    
    // 检查认证
    if (!authHeader.includes(btoa(uuid)) && !authHeader.includes(uuid)) {
      // 尝试从 URL 参数中获取认证信息
      const url = new URL(request.url);
      if (!url.searchParams.get('uuid') || url.searchParams.get('uuid') !== uuid) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // 创建 SOCKS5 握手响应
    const upgradeHeaders = request.headers;
    
    // 获取 SOCKS5 服务器地址（从环境变量或默认值）
    const socks5Server = env.SOCKS5 || `${hostName}:443`;
    
    // 连接到 SOCKS5 服务器
    const conn = await fetch(`wss://${socks5Server}/socks5`, {
      method: 'GET',
      headers: upgradeHeaders,
      cf: {
        cacheTtl: 0,
        cacheEverything: false,
        connectTimeout: 5000
      }
    });

    // 返回 SOCKS5 连接响应
    return new Response(conn.body, {
      status: conn.status,
      headers: conn.headers
    });
  } catch (error) {
    console.error('SOCKS5 连接失败:', error);
    return new Response('SOCKS5 连接失败', { status: 500 });
  }
}

/**
 * 建立管道连接
 * @param {ReadableStream} source - 源数据流
 * @param {WritableStream} destination - 目标数据流
 * @param {Function} onError - 错误处理函数
 * @returns {Promise<void>} 管道完成的 Promise
 */
export async function pipeStreams(source, destination, onError) {
  try {
    await source.pipeTo(destination, { preventClose: true });
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      console.error('管道建立失败:', error);
    }
  }
}