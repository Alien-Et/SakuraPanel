// 网络连接工具模块

/**
 * 尝试直连
 * @param {string} address - 地址
 * @param {number} port - 端口
 * @returns {Promise<Socket>} 连接的Socket
 */
export async function tryDirectConnect(address, port) {
  try {
    // 这里实现直连逻辑
    // 注意：在Cloudflare Workers环境中，可能需要使用fetch API或其他方式
    // 这里只是一个示例实现
    const response = await fetch(`http://${address}:${port}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5秒超时
    });
    
    if (response.ok) {
      return { success: true, address, port };
    }
    
    throw new Error(`连接失败: ${response.status}`);
  } catch (error) {
    console.error('直连失败:', error);
    throw error;
  }
}

/**
 * 验证密钥
 * @param {string} key - 密钥
 * @param {Object} env - Cloudflare Workers 环境对象
 * @returns {Promise<boolean>} 是否有效
 */
export async function verifyKey(key, env) {
  try {
    // 从KV数据库获取有效密钥列表
    const validKeys = await env.KV数据库.get('valid_keys');
    const keysArray = validKeys ? JSON.parse(validKeys) : [];
    
    // 检查密钥是否在有效列表中
    return keysArray.includes(key);
  } catch (error) {
    console.error('验证密钥失败:', error);
    return false;
  }
}

/**
 * 建立管道
 * @param {Socket} source - 源Socket
 * @param {Socket} destination - 目标Socket
 * @returns {Promise<void>}
 */
export async function establishPipe(source, destination) {
  try {
    // 这里实现管道建立逻辑
    // 在Cloudflare Workers环境中，可能需要使用TransformStream或其他方式
    // 这里只是一个示例实现
    const readableStream = source.readable || source;
    const writableStream = destination.writable || destination;
    
    await readableStream.pipeTo(writableStream);
  } catch (error) {
    console.error('建立管道失败:', error);
    throw error;
  }
}

/**
 * 创建SOCKS5连接
 * @param {string} address - 地址
 * @param {number} port - 端口
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<Socket>} SOCKS5连接
 */
export async function createSocks5Connection(address, port, username, password) {
  try {
    // 这里实现SOCKS5连接逻辑
    // 在Cloudflare Workers环境中，可能需要使用fetch API或其他方式
    // 这里只是一个示例实现
    
    // 创建SOCKS5握手请求
    const handshakeRequest = new Uint8Array([
      0x05, // SOCKS版本
      0x02, // 认证方法数量
      0x00, // 无认证
      0x02  // 用户名/密码认证
    ]);
    
    // 发送握手请求并接收响应
    // 注意：这里只是一个示例，实际实现可能需要使用WebSocket或其他方式
    
    // 如果需要认证，发送认证信息
    if (username && password) {
      const usernameBytes = new TextEncoder().encode(username);
      const passwordBytes = new TextEncoder().encode(password);
      
      const authRequest = new Uint8Array([
        0x01, // 认证版本
        usernameBytes.length, // 用户名长度
        ...usernameBytes, // 用户名
        passwordBytes.length, // 密码长度
        ...passwordBytes  // 密码
      ]);
      
      // 发送认证请求并接收响应
      // 注意：这里只是一个示例，实际实现可能需要使用WebSocket或其他方式
    }
    
    // 发送连接请求
    const addressBytes = new TextEncoder().encode(address);
    const portBytes = new Uint8Array([
      (port >> 8) & 0xff, // 端口高字节
      port & 0xff         // 端口低字节
    ]);
    
    const connectRequest = new Uint8Array([
      0x05, // SOCKS版本
      0x01, // 连接命令
      0x00, // 保留
      0x03, // 地址类型（域名）
      addressBytes.length, // 域名长度
      ...addressBytes, // 域名
      portBytes[0], // 端口高字节
      portBytes[1]  // 端口低字节
    ]);
    
    // 发送连接请求并接收响应
    // 注意：这里只是一个示例，实际实现可能需要使用WebSocket或其他方式
    
    return { success: true, address, port };
  } catch (error) {
    console.error('创建SOCKS5连接失败:', error);
    throw error;
  }
}

/**
 * 解析SOCKS5账号
 * @param {string} account - 账号字符串
 * @returns {Object} 解析后的账号信息
 */
export function parseSocks5Account(account) {
  try {
    // 格式通常是 username:password@host:port
    const match = account.match(/^([^:]+):([^@]+)@([^:]+):(\d+)$/);
    
    if (!match) {
      throw new Error('无效的SOCKS5账号格式');
    }
    
    return {
      username: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4])
    };
  } catch (error) {
    console.error('解析SOCKS5账号失败:', error);
    throw error;
  }
}

/**
 * 处理WebSocket升级请求
 * @param {Request} request - 请求对象
 * @returns {Promise<Response>} WebSocket升级响应
 */
export async function handleWebSocketUpgrade(request) {
  try {
    // 检查是否是WebSocket升级请求
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }
    
    // 创建WebSocket对
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    
    // 接受WebSocket连接
    server.accept();
    
    // 返回WebSocket升级响应
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  } catch (error) {
    console.error('处理WebSocket升级请求失败:', error);
    return new Response('WebSocket upgrade failed', { status: 500 });
  }
}

/**
 * 解密WebSocket消息
 * @param {string} message - 加密的消息
 * @param {string} key - 解密密钥
 * @returns {string} 解密后的消息
 */
export async function decryptWebSocketMessage(message, key) {
  try {
    // 这里实现解密逻辑
    // 注意：这只是一个示例实现，实际解密方式可能不同
    const keyBytes = new TextEncoder().encode(key);
    const messageBytes = new TextEncoder().encode(message);
    
    // 使用Web Crypto API进行解密
    const iv = messageBytes.slice(0, 12); // 假设IV是前12字节
    const encryptedData = messageBytes.slice(12);
    
    const algorithm = {
      name: 'AES-GCM',
      iv: iv
    };
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decryptedBytes = await crypto.subtle.decrypt(
      algorithm,
      cryptoKey,
      encryptedData
    );
    
    return new TextDecoder().decode(decryptedBytes);
  } catch (error) {
    console.error('解密WebSocket消息失败:', error);
    throw error;
  }
}

/**
 * 解析WebSocket头
 * @param {string} header - WebSocket头
 * @returns {Object} 解析后的头信息
 */
export function parseWebSocketHeader(header) {
  try {
    // 这里实现WebSocket头解析逻辑
    // 注意：这只是一个示例实现，实际解析方式可能不同
    const lines = header.split('\r\n');
    const result = {};
    
    // 解析第一行（请求行）
    const requestLine = lines[0].split(' ');
    if (requestLine.length >= 3) {
      result.method = requestLine[0];
      result.path = requestLine[1];
      result.version = requestLine[2];
    }
    
    // 解析其他行（头字段）
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        result[key] = value;
      }
    }
    
    return result;
  } catch (error) {
    console.error('解析WebSocket头失败:', error);
    throw error;
  }
}

/**
 * 智能连接
 * @param {string} address - 地址
 * @param {number} port - 端口
 * @param {Object} options - 连接选项
 * @returns {Promise<Socket>} 连接的Socket
 */
export async function smartConnect(address, port, options = {}) {
  try {
    // 这里实现智能连接逻辑
    // 根据选项选择不同的连接方式
    
    // 默认选项
    const {
      useProxy = false,
      proxyType = 'socks5',
      proxyHost = '127.0.0.1',
      proxyPort = 1080,
      proxyUsername = '',
      proxyPassword = '',
      timeout = 5000
    } = options;
    
    // 如果不使用代理，尝试直连
    if (!useProxy) {
      return await tryDirectConnect(address, port);
    }
    
    // 如果使用SOCKS5代理
    if (proxyType === 'socks5') {
      return await createSocks5Connection(
        address,
        port,
        proxyUsername,
        proxyPassword
      );
    }
    
    // 其他代理类型可以在这里添加
    
    throw new Error(`不支持的代理类型: ${proxyType}`);
  } catch (error) {
    console.error('智能连接失败:', error);
    throw error;
  }
}

/**
 * 创建TCP接口
 * @param {Object} options - TCP选项
 * @returns {Promise<Object>} TCP接口对象
 */
export async function createTcpInterface(options = {}) {
  try {
    // 这里实现TCP接口创建逻辑
    // 在Cloudflare Workers环境中，可能需要使用WebSocket或其他方式
    // 这里只是一个示例实现
    
    const {
      host = '0.0.0.0',
      port = 0,
      backlog = 128
    } = options;
    
    // 返回TCP接口对象
    return {
      host,
      port,
      backlog,
      async listen(callback) {
        // 这里实现监听逻辑
        console.log(`TCP接口监听 ${host}:${port}`);
        
        // 模拟连接事件
        if (typeof callback === 'function') {
          // 在实际实现中，这里应该处理实际的连接
          // 这里只是一个示例
          setTimeout(() => {
            callback({
              remoteAddress: '127.0.0.1',
              remotePort: 12345,
              async ondata(data) {
                // 处理接收到的数据
                console.log('接收到数据:', data);
              },
              async write(data) {
                // 发送数据
                console.log('发送数据:', data);
              },
              async end() {
                // 关闭连接
                console.log('连接已关闭');
              }
            });
          }, 1000);
        }
        
        return this;
      },
      async close() {
        // 关闭TCP接口
        console.log(`TCP接口 ${host}:${port} 已关闭`);
      }
    };
  } catch (error) {
    console.error('创建TCP接口失败:', error);
    throw error;
  }
}

/**
 * 建立连接管道
 * @param {Object} source - 源连接
 * @param {Object} destination - 目标连接
 * @returns {Promise<void>}
 */
export async function establishConnectionPipe(source, destination) {
  try {
    // 这里实现连接管道建立逻辑
    // 在Cloudflare Workers环境中，可能需要使用TransformStream或其他方式
    // 这里只是一个示例实现
    
    // 创建数据流
    const sourceStream = source.readable || source;
    const destinationStream = destination.writable || destination;
    
    // 建立管道
    await sourceStream.pipeTo(destinationStream);
    
    // 如果需要双向通信，也建立反向管道
    if (source.writable && destination.readable) {
      await destination.readable.pipeTo(source.writable);
    }
  } catch (error) {
    console.error('建立连接管道失败:', error);
    throw error;
  }
}