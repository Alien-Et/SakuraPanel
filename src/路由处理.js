import { 共享状态 } from './共享状态.js';
import { 创建HTML响应, 创建重定向响应, 创建JSON响应, 生成UUID, 加密密码, 提取设备指纹, 检查锁定, 验证订阅Token, 获取流量信息头, 生成订阅Token, 查询CF请求数, 解析节点, 获取Cookie值, 验证请求Token, 获取表单数据, 默认节点路径, 配置路径映射, D1初始化, D1获取, D1设置, D1删除, D1批量获取, log, error } from './逻辑/辅助函数.js';
import { 获取或初始化UUID, 加载节点和配置 } from './逻辑/节点配置.js';
import { 升级请求 } from './逻辑/WebSocket处理.js';
import { 生成猫咪, 生成通用, 生成SingBox } from './逻辑/配置生成器.js';
import { 生成登录注册界面 } from './界面_登录注册/模板.js';
import { 生成订阅页面 } from './界面_面板/模板.js';
import { 生成D1未绑定提示页面, 生成错误页面 } from './界面_D1提示/模板.js';

// ====================== 主逻辑 ======================
export async function 路由处理(请求, env) {
  try {
    if (!env.D1DB) {
      return 创建HTML响应(生成D1未绑定提示页面());
    }
    await D1初始化(env);

    const 请求头 = 请求.headers.get('Upgrade');
    const url = new URL(请求.url);
    const hostName = 请求.headers.get('Host');
    const UA = 请求.headers.get('User-Agent') || 'unknown';
    const IP = 请求.headers.get('CF-Connecting-IP') || 'unknown';
    const 设备标识 = 提取设备指纹(UA) + '_' + IP;
    let formData;

    log(`[路由] ${请求.method} ${url.pathname} Upgrade=${请求头} UA=${UA} IP=${IP}`);

    if (url.pathname === '/favicon.ico') {
      return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌸</text></svg>', {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }

    if (请求头 && 请求头 === 'websocket') {
      const proxySettings = await D1批量获取(env, ['proxyIP', 'socks5']);
      共享状态.反代地址 = (proxySettings.proxyIP) || env.PROXYIP || 共享状态.反代地址;
      共享状态.SOCKS5账号 = (proxySettings.socks5) || env.SOCKS5 || 共享状态.SOCKS5账号;
      log(`[路由] WebSocket 升级: 反代=${共享状态.反代地址 || '无'} SOCKS5=${共享状态.SOCKS5账号 ? '已配置' : '无'}`);
      return await 升级请求(请求, env);
    }

    if (url.pathname === '/login/submit' || url.pathname === '/register/submit') {
      const contentType = 请求.headers.get('Content-Type') || '';
      if (!contentType.includes('application/x-www-form-urlencoded') && !contentType.includes('multipart/form-data')) {
        log(`无效请求: UA=${UA}, IP=${IP}, Path=${url.pathname}, Headers=${JSON.stringify([...请求.headers])}`);
        return 创建HTML响应(生成登录注册界面(url.pathname === '/login/submit' ? '登录' : '注册', {
          错误信息: '请通过正常表单提交'
        }), 400);
      }

      formData = await 获取表单数据(请求);
      if (!formData) {
        return 创建HTML响应(生成登录注册界面(url.pathname === '/login/submit' ? '登录' : '注册', {
          错误信息: '提交数据格式错误，请重试'
        }), 400);
      }
    }

    if (url.pathname === '/register/submit') {
      const 用户名 = formData.get('username');
      const 密码 = formData.get('password');
      const 确认密码 = formData.get('confirm');

      if (!用户名 || !密码 || 密码 !== 确认密码) {
        return 创建HTML响应(生成登录注册界面('注册', {
          错误信息: 密码 !== 确认密码 ? '两次密码不一致' : '请填写完整信息'
        }), 400);
      }

      const 已有用户 = await D1获取(env, 'stored_credentials');
      if (已有用户) {
        return 创建重定向响应('/login');
      }

      const 加密密码值 = await 加密密码(密码);
      await D1设置(env, 'stored_credentials', JSON.stringify({
        用户名, 密码: 加密密码值
      }));

      const 新Token = Math.random().toString(36).substring(2);
      await D1设置(env, 'current_token', 新Token, 300);
      return 创建重定向响应(`/${共享状态.配置路径}`, {
        'Set-Cookie': `token=${新Token}; Path=/; HttpOnly; SameSite=Strict`
      });
    }

    if (url.pathname === '/login/submit') {
      const 锁定状态 = await 检查锁定(env, 设备标识);
      if (锁定状态.被锁定) {
        return 创建HTML响应(生成登录注册界面('登录', {
          锁定状态: true,
          剩余时间: 锁定状态.剩余时间
        }), 403);
      }

      const 存储凭据 = await D1获取(env, 'stored_credentials');
      if (!存储凭据) {
        return 创建重定向响应('/register');
      }

      const 输入用户名 = formData.get('username');
      const 输入密码 = formData.get('password');

      const 凭据对象 = JSON.parse(存储凭据 || '{}');
      const 密码匹配 = (await 加密密码(输入密码)) === 凭据对象.密码;
      if (输入用户名 === 凭据对象.用户名 && 密码匹配) {
        const 新Token = Math.random().toString(36).substring(2);
        await D1设置(env, 'current_token', 新Token, 300);
        await D1设置(env, `fail_${设备标识}`, '0', 1800);
        return 创建重定向响应(`/${共享状态.配置路径}`, {
          'Set-Cookie': `token=${新Token}; Path=/; HttpOnly; SameSite=Strict`
        });
      }

      let 失败次数 = Number(await D1获取(env, `fail_${设备标识}`) || 0) + 1;
      await D1设置(env, `fail_${设备标识}`, String(失败次数), 1800);

      if (失败次数 >= 共享状态.最大失败次数) {
        await D1设置(env, `lock_${设备标识}`, String(Date.now() + 共享状态.锁定时间), 300);
        const 新锁定状态 = await 检查锁定(env, 设备标识);
        return 创建HTML响应(生成登录注册界面('登录', {
          锁定状态: true,
          剩余时间: 新锁定状态.剩余时间
        }), 403);
      }

      return 创建HTML响应(生成登录注册界面('登录', {
        输错密码: true,
        剩余次数: 共享状态.最大失败次数 - 失败次数
      }), 401);
    }

    const 是否已注册 = await D1获取(env, 'stored_credentials');
    if (!是否已注册 && url.pathname !== '/register') {
      return 创建HTML响应(生成登录注册界面('注册'));
    }

    switch (url.pathname) {
      case '/register': {
        const 已注册 = await D1获取(env, 'stored_credentials');
        if (已注册) {
          return 创建重定向响应('/login');
        }
        return 创建HTML响应(生成登录注册界面('注册'));
      }

      case '/login':
        const 存储凭据 = await D1获取(env, 'stored_credentials');
        if (!存储凭据) {
          return 创建重定向响应('/register');
        }

        const 锁定状态 = await 检查锁定(env, 设备标识);
        if (锁定状态.被锁定) {
          return 创建HTML响应(生成登录注册界面('登录', { 锁定状态: true, 剩余时间: 锁定状态.剩余时间 }));
        }
        if (请求.headers.get('Cookie')?.split('=')[1] === await D1获取(env, 'current_token')) {
          return 创建重定向响应(`/${共享状态.配置路径}`);
        }
        const 失败次数 = Number(await D1获取(env, `fail_${设备标识}`) || 0);
        return 创建HTML响应(生成登录注册界面('登录', { 输错密码: 失败次数 > 0, 剩余次数: 共享状态.最大失败次数 - 失败次数 }));

      case '/reset-login-failures':
        try {
          await D1设置(env, `fail_${设备标识}`, '0', 1800);
          await D1删除(env, `lock_${设备标识}`);
        } catch {}
        return new Response(null, { status: 200 });

      case '/check-lock':
        try {
          const 锁定检查 = await 检查锁定(env, 设备标识);
          return 创建JSON响应({
            locked: 锁定检查.被锁定,
            remainingTime: 锁定检查.剩余时间
          });
        } catch {
          return 创建JSON响应({ locked: false, remainingTime: 0 });
        }

      case `/${共享状态.配置路径}`:
        const Token = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效Token = await D1获取(env, 'current_token');
        if (!Token || Token !== 有效Token) return 创建重定向响应('/login');
        const uuid = await 获取或初始化UUID(env);
        return 创建HTML响应(生成订阅页面(共享状态.配置路径, hostName, uuid));

      case `/${共享状态.配置路径}/logout`:
        await D1删除(env, 'current_token');
        return 创建重定向响应('/login', { 'Set-Cookie': 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict' });

      case `/${共享状态.配置路径}/reset`:
        if (请求.method !== 'POST') return 创建JSON响应({ error: '方法不允许' }, 405);
        try {
          formData = await 请求.formData();
        } catch {
          return 创建JSON响应({ error: '提交数据格式错误，请重试' }, 400);
        }

        const 重置用户名 = formData.get('username');
        const 重置密码 = formData.get('password');
        const 重置存储凭据 = await D1获取(env, 'stored_credentials');
        if (!重置存储凭据) return 创建JSON响应({ error: '账号不存在' }, 400);
        const 凭据对象 = JSON.parse(重置存储凭据 || '{}');
        const 密码匹配 = (await 加密密码(重置密码)) === 凭据对象.密码;
        if (!(重置用户名 === 凭据对象.用户名 && 密码匹配)) {
          return 创建JSON响应({ error: '账号或密码错误' }, 401);
        }

        const 需要删除的键 = [
          'stored_credentials', 'current_token', 'current_uuid',
          'manual_preferred_ips', 'node_file_paths',
          'proxyEnabled', 'proxyType', 'forceProxy', 'proxyIP', 'socks5',
          'b64Enabled', 'echEnabled', 'echSNI', 'echDNS',
          'subTokenEnabled', 'airportName',
          'custom_light_bg', 'custom_dark_bg',
          'cf_account_id', 'cf_api_token', 'cf_email', 'cf_global_api_key', 'cf_usage_cache'
        ];
        for (const key of 需要删除的键) {
          try { await D1删除(env, key); } catch {}
        }

        return 创建JSON响应({ success: true, redirect: '/register' });

      case `/${共享状态.配置路径}/` + 配置路径映射.魔法1: {
        if (!(await 验证订阅Token(env, hostName, url))) return 创建JSON响应({ error: 'Token无效或缺失' }, 403);
        await 加载节点和配置(env, hostName);
        const config = await 生成猫咪(env, hostName);
        const 机场名称 = await D1获取(env, 'airportName') || '樱花订阅';
        const cleanAirportName = 机场名称.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '');
        const 流量头 = await 获取流量信息头(env);
        return new Response(config, {
          status: 200,
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
            "Content-Disposition": `inline; filename="subscription"; filename*=utf-8''${encodeURIComponent(cleanAirportName)}`,
            ...流量头
          }
        });
      }

      case `/${共享状态.配置路径}/` + 配置路径映射.魔法2: {
        if (!(await 验证订阅Token(env, hostName, url))) return 创建JSON响应({ error: 'Token无效或缺失' }, 403);
        await 加载节点和配置(env, hostName);
        const 手机通用配置 = await 生成通用(env, hostName);
        const 机场名称 = await D1获取(env, 'airportName') || '樱花订阅';
        const cleanAirportName = 机场名称.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '');
        const 流量头ng = await 获取流量信息头(env);
        return new Response(手机通用配置, {
          status: 200,
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
            "Content-Disposition": `inline; filename="subscription"; filename*=utf-8''${encodeURIComponent(cleanAirportName)}`,
            ...流量头ng
          }
        });
      }

      case `/${共享状态.配置路径}/` + 配置路径映射.魔法3: {
        if (!(await 验证订阅Token(env, hostName, url))) return 创建JSON响应({ error: 'Token无效或缺失' }, 403);
        await 加载节点和配置(env, hostName);
        const singbox配置 = await 生成SingBox(env, hostName);
        const singbox机场名称 = await D1获取(env, 'airportName') || '樱花订阅';
        const cleanSbName = singbox机场名称.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '');
        const 流量头sb = await 获取流量信息头(env);
        return new Response(singbox配置, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `inline; filename="subscription"; filename*=utf-8''${encodeURIComponent(cleanSbName)}`,
            ...流量头sb
          }
        });
      }

      case `/${共享状态.配置路径}/upload`:
        const uploadToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效UploadToken = await D1获取(env, 'current_token');
        if (!uploadToken || uploadToken !== 有效UploadToken) {
          return 创建JSON响应({ error: '未登录或Token无效，请重新登录' }, 401);
        }
        formData = await 请求.formData();
        const ipFiles = formData.getAll('ipFiles');
        if (!ipFiles || ipFiles.length === 0) {
          return 创建JSON响应({ error: '未选择任何文件' }, 400);
        }
        let allIpList = [];
        try {
          for (const ipFile of ipFiles) {
            if (!ipFile || !ipFile.text) throw new Error(`文件 ${ipFile.name} 无效`);

            // 验证文件格式
            if (!ipFile.name.toLowerCase().endsWith('.txt')) {
              throw new Error(`文件 ${ipFile.name} 不是txt格式，仅允许上传txt格式文件`);
            }

            // 验证文件大小（限制为1MB）
            if (ipFile.size > 1024 * 1024) {
              throw new Error(`文件 ${ipFile.name} 超过大小限制（1MB）`);
            }

            const ipText = await ipFile.text();

            // 验证文件内容格式
            const lines = ipText.split('\n').map(line => line.trim()).filter(Boolean);
            if (lines.length === 0) {
              console.warn(`文件 ${ipFile.name} 内容为空`);
              continue;
            }

            // 验证每行是否符合节点格式：[地址]:端口#节点名称@tls 或 [地址]:端口#节点名称@notls
            const validLines = [];
            for (const line of lines) {
              // 基本格式验证
              // 更灵活的节点格式验证，允许以下格式：
              // 1. 完整格式：[地址]:端口#节点名称@tls/notls
              // 2. 不带端口：[地址]#节点名称@tls/notls
              // 3. 不带tls/notls：[地址]:端口#节点名称
              // 4. 最简格式：[地址]#节点名称
              // 现在支持IP地址（IPv4/IPv6）和域名
              const nodePattern = /^(\[[0-9a-fA-F:]+\]|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*)(?::([0-9]{1,5}))?(?:#(.+?))?(?:@(tls|notls))?$/;
              const match = nodePattern.exec(line);
              if (!match) {
                console.warn(`文件 ${ipFile.name} 中的行格式不正确，将被忽略: ${line}`);
                continue;
              }

              const address = match[1];
              const port = match[2];
              const nodeName = match[3] || 共享状态.节点名称; // 使用全局变量节点名称作为默认值
              const protocol = match[4] || 'tls'; // 默认使用tls

              // 如果有端口，验证端口范围
              if (port) {
                const portNum = parseInt(port);
                if (portNum < 1 || portNum > 65535) {
                  console.warn(`文件 ${ipFile.name} 中的端口无效，将被忽略: ${line}`);
                  continue;
                }
              }

              // 验证IP地址格式（如果是IPv4）
              const ipv4Pattern = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/;
              if (ipv4Pattern.test(address)) {
                const ipParts = address.split('.');
                let isValidIPv4 = true;
                for (const part of ipParts) {
                  const num = parseInt(part);
                  if (num < 0 || num > 255) {
                    isValidIPv4 = false;
                    break;
                  }
                }
                if (!isValidIPv4) {
                  console.warn(`文件 ${ipFile.name} 中的IPv4地址无效，将被忽略: ${line}`);
                  continue;
                }
              }

              // 标准化节点格式
              const standardPort = port || (protocol === 'notls' ? '80' : '443');
              const standardizedLine = `${address}:${standardPort}#${nodeName}@${protocol}`;
              validLines.push(standardizedLine);
            }

            if (validLines.length === 0) {
              throw new Error(`文件 ${ipFile.name} 中没有符合格式要求的节点`);
            }

            log(`文件 ${ipFile.name} 验证通过，有效节点数: ${validLines.length}`);
            allIpList = allIpList.concat(validLines);
          }
          if (allIpList.length === 0) {
            return 创建JSON响应({ error: '所有上传文件中没有符合格式要求的节点' }, 400);
          }
          // 合并现有手动节点 + 新上传节点，按 地址:端口 去重（新上传覆盖旧的，可更新名称）
          const 当前手动节点 = await D1获取(env, 'manual_preferred_ips');
          const 当前节点列表 = 当前手动节点 ? JSON.parse(当前手动节点) : [];
          const 合并Map = new Map();
          for (const 节点 of 当前节点列表) {
            const 解析 = 解析节点(节点);
            if (解析) 合并Map.set(解析.去重键, 节点);
          }
          for (const 节点 of allIpList) {
            const 解析 = 解析节点(节点);
            if (解析) 合并Map.set(解析.去重键, 节点);
          }
          const uniqueIpList = [...合并Map.values()];

          // 去重统计：上传数、新增数、去重数、当前总数
          const 上传节点数 = allIpList.length;
          const 新增数 = uniqueIpList.length - 当前节点列表.length;
          const 去重数 = 上传节点数 - 新增数;
          const 当前总数 = uniqueIpList.length;

          const 是重复上传 = JSON.stringify(当前节点列表.sort()) === JSON.stringify(uniqueIpList.sort());
          if (是重复上传) {
            return 创建JSON响应({ message: '上传内容与现有节点相同：共上传 ' + 上传节点数 + ' 个均为已有节点，当前共 ' + 当前总数 + ' 个手动节点，无需更新' }, 200);
          }

          await D1设置(env, 'manual_preferred_ips', JSON.stringify(uniqueIpList));
          return 创建JSON响应({ message: '上传成功：共上传 ' + 上传节点数 + ' 个，新增 ' + 新增数 + ' 个，去重 ' + 去重数 + ' 个，当前共 ' + 当前总数 + ' 个手动节点' }, 200, { 'Location': `/${共享状态.配置路径}` });
        } catch (错误) {
          error(`上传处理失败: ${错误.message}`);
          return 创建JSON响应({ error: `上传处理失败: ${错误.message}` }, 500);
        }

      case `/${共享状态.配置路径}/change-uuid`:
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const 新UUID = 生成UUID();
        await D1设置(env, 'current_uuid', 新UUID);
        return 创建JSON响应({ uuid: 新UUID }, 200);

      case `/${共享状态.配置路径}/add-node-path`:
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const addData = await 请求.json();
        const newPath = addData.path;
        if (!newPath || !newPath.match(/^https?:\/\//)) {
          return 创建JSON响应({ error: '无效的URL格式' }, 400);
        }
        let currentPaths = await D1获取(env, 'node_file_paths');
        currentPaths = currentPaths ? JSON.parse(currentPaths) : ['https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt', 'https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt'];
        if (currentPaths.includes(newPath)) {
          return 创建JSON响应({ error: '该路径已存在' }, 400);
        }
        // 先验证新 URL 能否拉取
        let 拉取状态 = '';
        try {
          const 验证响应 = await fetch(newPath);
          if (验证响应.ok) {
            const 文本 = await 验证响应.text();
            const 行数 = 文本.split('\n').map(l => l.trim()).filter(Boolean).length;
            拉取状态 = '拉取成功，含 ' + 行数 + ' 个节点';
          } else {
            拉取状态 = '拉取失败（HTTP ' + 验证响应.status + '），请检查 URL';
          }
        } catch (e) {
          拉取状态 = '拉取异常：' + e.message;
        }
        currentPaths.push(newPath);
        await D1设置(env, 'node_file_paths', JSON.stringify(currentPaths));
        // 节点实时拉取，直接加载即可获取最新节点数
        await 加载节点和配置(env, hostName);
        const 总节点数 = 共享状态.优选节点.length;
        return 创建JSON响应({ success: true, 消息: 拉取状态 + '；当前总节点数 ' + 总节点数 }, 200);

      case `/${共享状态.配置路径}/remove-node-path`:
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const removeData = await 请求.json();
        const index = removeData.index;
        let paths = await D1获取(env, 'node_file_paths');
        paths = paths ? JSON.parse(paths) : ['https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt', 'https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt'];
        if (index < 0 || index >= paths.length) {
          return 创建JSON响应({ error: '无效的索引' }, 400);
        }
        paths.splice(index, 1);
        await D1设置(env, 'node_file_paths', JSON.stringify(paths));
        共享状态.优选节点 = [];
        await 加载节点和配置(env, hostName);
        return 创建JSON响应({ success: true }, 200);

      case `/${共享状态.配置路径}/get-node-paths`:
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        let nodePaths = await D1获取(env, 'node_file_paths');
        nodePaths = nodePaths ? JSON.parse(nodePaths) : 默认节点路径;
        return 创建JSON响应({ paths: nodePaths }, 200);

      case '/set-proxy-state':
        formData = await 请求.formData();
        const proxyEnabled = formData.get('proxyEnabled');
        const proxyType = formData.get('proxyType');
        let forceProxy = formData.get('forceProxy');
        await D1设置(env, 'proxyEnabled', proxyEnabled);
        await D1设置(env, 'proxyType', proxyType);
        // 可选：反代地址和 SOCKS5 账号（表单提交时携带），留空表示使用默认值
        if (formData.has('proxyIP')) {
          const proxyIP = (formData.get('proxyIP') || '').trim();
          await D1设置(env, 'proxyIP', proxyIP);
          共享状态.反代地址 = proxyIP || env.PROXYIP || 共享状态.反代地址;
        }
        if (formData.has('socks5')) {
          const socks5 = (formData.get('socks5') || '').trim();
          await D1设置(env, 'socks5', socks5);
          共享状态.SOCKS5账号 = socks5 || env.SOCKS5 || 共享状态.SOCKS5账号;
        }
        // 如果强制代理但未配置反代和SOCKS5，自动关闭强制代理
        if (forceProxy === 'true' && !共享状态.反代地址 && !共享状态.SOCKS5账号) {
          forceProxy = 'false';
          await D1设置(env, 'forceProxy', 'false');
        }
        await D1设置(env, 'forceProxy', forceProxy);
        return new Response(null, { status: 200 });

      case '/get-proxy-status': {
        const proxySettings = await D1批量获取(env, ['proxyEnabled', 'proxyType', 'forceProxy', 'proxyIP', 'socks5']);
        const 代理启用 = proxySettings.proxyEnabled !== 'false';
        const 代理类型 = proxySettings.proxyType || 'reverse';
        const 强制代理 = proxySettings.forceProxy === 'true';
        const 当前反代地址 = (proxySettings.proxyIP) || env.PROXYIP || 共享状态.反代地址;
        const SOCKS5账号 = (proxySettings.socks5) || env.SOCKS5 || '';
        let status = '直连';
        let 连接地址 = '';
        let 出口IP = '未知';

        if (代理启用) {
          if (强制代理) {
            if (代理类型 === 'reverse' && 当前反代地址) {
              status = '强制反代';
              连接地址 = 当前反代地址;
            } else if (代理类型 === 'socks5' && SOCKS5账号) {
              status = '强制SOCKS5';
              连接地址 = SOCKS5账号.split('@').pop() || SOCKS5账号;
            }

            // === 新增：检测代理出口 IP ===
            try {
              const ipCheck = await fetch('https://ipapi.co/json/');
              if (ipCheck.ok) {
                const data = await ipCheck.json();
                出口IP = `${data.ip} (${data.country_name || '未知地区'})`;
              }
            } catch (e) {
              出口IP = '检测失败';
            }

          } else if (代理类型 === 'reverse' && 当前反代地址) {
            status = '动态反代';
            连接地址 = 当前反代地址;
          } else if (代理类型 === 'socks5' && SOCKS5账号) {
            status = '动态SOCKS5';
            连接地址 = SOCKS5账号.split('@').pop() || SOCKS5账号;
          }
        }

        return 创建JSON响应({ status, 连接地址, 出口IP });
      }

      case '/get-proxy-settings': {
        const proxySettings = await D1批量获取(env, ['proxyEnabled', 'proxyType', 'forceProxy', 'proxyIP', 'socks5']);
        const proxyEnabled = proxySettings.proxyEnabled !== 'false';
        const proxyType = proxySettings.proxyType || 'reverse';
        const forceProxy = proxySettings.forceProxy === 'true';
        const proxyIP = proxySettings.proxyIP || '';
        const socks5 = proxySettings.socks5 || '';
        return 创建JSON响应({ proxyEnabled, proxyType, forceProxy, proxyIP, socks5 });
      }

      case '/set-b64-state':
        formData = await 请求.formData();
        const b64Enabled = formData.get('b64Enabled');
        await D1设置(env, 'b64Enabled', b64Enabled);
        return new Response(null, { status: 200 });

      case '/get-b64-status':
        const b64状态 = await D1获取(env, 'b64Enabled') !== 'false';
        return 创建JSON响应({ b64Enabled: b64状态 });

      case '/get-ech-config': {
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const echSettings = await D1批量获取(env, ['echEnabled', 'echSNI', 'echDNS']);
        const echEnabled = echSettings.echEnabled !== 'false';
        const echSNI = (echSettings.echSNI) || '';
        const echDNS = (echSettings.echDNS) || 'https://dns.alidns.com/dns-query';
        return 创建JSON响应({ echEnabled, echSNI, echDNS });
      }

      case '/set-ech-state': {
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 获取表单数据(请求);
        if (!formData) {
          return 创建JSON响应({ error: '提交数据格式错误，请重试' }, 400);
        }
        const echEnabledValue = formData.get('echEnabled') === 'true';
        await D1设置(env, 'echEnabled', String(echEnabledValue));
        return new Response(null, { status: 200 });
      }

      case '/set-ech-config': {
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 获取表单数据(请求);
        if (!formData) {
          return 创建JSON响应({ error: '提交数据格式错误，请重试' }, 400);
        }
        const sni = (formData.get('echSNI') || '').toString().trim();
        const dns = (formData.get('echDNS') || '').toString().trim() || 'https://dns.alidns.com/dns-query';
        await D1设置(env, 'echSNI', sni);
        await D1设置(env, 'echDNS', dns);
        return new Response(null, { status: 200 });
      }

      case '/set-airport-name':
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 获取表单数据(请求);
        if (!formData) {
          return 创建JSON响应({ error: '提交数据格式错误，请重试' }, 400);
        }
        const airportName = formData.get('airportName') || '樱花订阅';
        await D1设置(env, 'airportName', airportName);
        return new Response(null, { status: 200 });

      case '/get-airport-name':
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const currentAirportName = await D1获取(env, 'airportName') || '樱花订阅';
        return 创建JSON响应({ airportName: currentAirportName });

      case '/set-wallpaper':
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 获取表单数据(请求);
        if (!formData) {
          return 创建JSON响应({ error: '提交数据格式错误，请重试' }, 400);
        }
        const lightWallpaper = formData.get('lightWallpaper') || '';
        const darkWallpaper = formData.get('darkWallpaper') || '';
        await D1设置(env, 'custom_light_bg', lightWallpaper);
        await D1设置(env, 'custom_dark_bg', darkWallpaper);
        return 创建JSON响应({ success: true });

      case '/get-wallpaper':
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const wallpapers = await D1批量获取(env, ['custom_light_bg', 'custom_dark_bg']);
        const customLightBg = wallpapers.custom_light_bg || '';
        const customDarkBg = wallpapers.custom_dark_bg || '';
        return 创建JSON响应({ lightWallpaper: customLightBg, darkWallpaper: customDarkBg });

      case '/get-wallpaper-public':
        // 公共API，不需要认证，用于登录/注册界面
        try {
          const wallpapers = await D1批量获取(env, ['custom_light_bg', 'custom_dark_bg']);
          const publicLightBg = wallpapers.custom_light_bg || '';
          const publicDarkBg = wallpapers.custom_dark_bg || '';
          return 创建JSON响应({ lightWallpaper: publicLightBg, darkWallpaper: publicDarkBg });
        } catch {
          return 创建JSON响应({ lightWallpaper: '/default-light.png', darkWallpaper: '/default-dark.png' });
        }

      case '/reset-wallpaper':
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        await D1删除(env, 'custom_light_bg');
        await D1删除(env, 'custom_dark_bg');
        return 创建JSON响应({ success: true });

      case `/${共享状态.配置路径}/generate-cat-config`:
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        try {
          await 加载节点和配置(env, hostName);
          await 生成猫咪(env, hostName);
          return 创建JSON响应({ success: true });
        } catch (错误) {
          error(`生成猫咪配置失败: ${错误.message}`);
          return 创建JSON响应({ error: `生成猫咪配置失败: ${错误.message}` }, 500);
        }

      case `/${共享状态.配置路径}/generate-universal-config`:
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        try {
          await 加载节点和配置(env, hostName);
          await 生成通用(env, hostName);
          return 创建JSON响应({ success: true });
        } catch (错误) {
          error(`生成通用配置失败: ${错误.message}`);
          return 创建JSON响应({ error: `生成通用配置失败: ${错误.message}` }, 500);
        }

      case '/get-sub-token': {
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const subTokenSettings = await D1批量获取(env, ['subTokenEnabled', 'current_uuid']);
        const subTokenEnabled = subTokenSettings.subTokenEnabled !== 'false';
        const uuid = subTokenSettings.current_uuid;
        const subToken = uuid ? await 生成订阅Token(hostName, uuid) : '';
        return 创建JSON响应({ subTokenEnabled, subToken });
      }

      case '/set-sub-token-state': {
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 获取表单数据(请求);
        if (!formData) {
          return 创建JSON响应({ error: '提交数据格式错误，请重试' }, 400);
        }
        await D1设置(env, 'subTokenEnabled', formData.get('subTokenEnabled'));
        return new Response(null, { status: 200 });
      }

      case '/get-cf-credentials': {
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const cfCredentials = await D1批量获取(env, ['cf_account_id', 'cf_api_token', 'cf_email', 'cf_global_api_key']);
        const accountId = cfCredentials.cf_account_id || '';
        const apiToken = cfCredentials.cf_api_token || '';
        const email = cfCredentials.cf_email || '';
        const globalApiKey = cfCredentials.cf_global_api_key || '';
        // 根据是否填入凭证自动判定是否启用请求统计
        const subInfoEnabled = !!(accountId && apiToken) || !!(email && globalApiKey);
        const authMethod = apiToken ? 'token' : (email ? 'email' : 'token');
        return 创建JSON响应({ subInfoEnabled, authMethod, accountId, apiToken, email, globalApiKey });
      }

      case '/set-cf-credentials': {
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 获取表单数据(请求);
        if (!formData) {
          return 创建JSON响应({ error: '提交数据格式错误，请重试' }, 400);
        }
        const authMethod = formData.get('authMethod') || 'token';
        const accountId = formData.get('accountId') || '';
        const apiToken = formData.get('apiToken') || '';
        const email = formData.get('email') || '';
        const globalApiKey = formData.get('globalApiKey') || '';
        // 请求统计根据是否填入凭证自动开启：有凭证则开启，无凭证则不开启
        const hasCredentials = (accountId && apiToken) || (email && globalApiKey);
        await D1设置(env, 'subInfoEnabled', hasCredentials ? 'true' : 'false');
        await D1设置(env, 'cf_account_id', accountId);
        if (authMethod === 'token') {
          // Token 方式：保存 Token 字段，清空邮箱方式字段
          await D1设置(env, 'cf_api_token', apiToken);
          await D1删除(env, 'cf_email');
          await D1删除(env, 'cf_global_api_key');
        } else {
          // 邮箱方式：保存邮箱字段，清空 Token 字段
          await D1删除(env, 'cf_api_token');
          await D1设置(env, 'cf_email', email);
          await D1设置(env, 'cf_global_api_key', globalApiKey);
        }
        await D1删除(env, 'cf_usage_cache');
        return new Response(null, { status: 200 });
      }

      case '/get-cf-usage': {
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const 用量 = await 查询CF请求数(env);
        return 创建JSON响应(用量);
      }

      case `/${共享状态.配置路径}/get-manual-nodes`: {
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const manualNodes = await D1获取(env, 'manual_preferred_ips');
        const nodeList = manualNodes ? JSON.parse(manualNodes) : [];
        return 创建JSON响应({ nodes: nodeList });
      }

      case `/${共享状态.配置路径}/remove-manual-node`: {
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const removeData = await 请求.json();
        const removeIndex = removeData.index;
        const currentManualNodes = await D1获取(env, 'manual_preferred_ips');
        const currentNodeList = currentManualNodes ? JSON.parse(currentManualNodes) : [];
        if (removeIndex < 0 || removeIndex >= currentNodeList.length) {
          return 创建JSON响应({ error: '无效的索引' }, 400);
        }
        currentNodeList.splice(removeIndex, 1);
        await D1设置(env, 'manual_preferred_ips', JSON.stringify(currentNodeList));
        return 创建JSON响应({ success: true, nodes: currentNodeList });
      }

      case `/${共享状态.配置路径}/clear-manual-nodes`: {
        if (!await 验证请求Token(请求, env)) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        await D1删除(env, 'manual_preferred_ips');
        return 创建JSON响应({ success: true, nodes: [] });
      }

      default: {
        // 伪装域名：所有未匹配路径转发到伪装域名
        const 伪装URL = new URL(url);
        伪装URL.hostname = 共享状态.伪装域名;
        伪装URL.protocol = 'https:';
        try {
          return await fetch(伪装URL, 请求);
        } catch (错误) {
          error(`伪装请求失败: ${错误.message}`);
          return 创建HTML响应(生成错误页面('服务暂时不可用'), 502);
        }
      }
    }
  } catch (error) {
    error(`全局错误: ${error.message}`);
    // 浏览器页面请求返回 HTML 错误页（如 D1 配额超限），API/订阅请求仍返回 JSON
    const acceptHeader = 请求.headers.get('Accept') || '';
    if (acceptHeader.includes('text/html')) {
      return 创建HTML响应(生成错误页面(error.message), 500);
    }
    return 创建JSON响应({ error: `服务器内部错误: ${error.message}` }, 500);
  }
}
