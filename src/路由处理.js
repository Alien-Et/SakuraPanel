import { 共享状态 } from './共享状态.js';
import { 创建HTML响应, 创建重定向响应, 创建JSON响应, 生成UUID, 加密密码, 检查锁定, 验证订阅Token, 获取流量信息头, 生成订阅Token, 查询CF请求数 } from './逻辑/辅助函数.js';
import { 获取或初始化UUID, 加载节点和配置, 获取配置 } from './逻辑/节点配置.js';
import { 升级请求 } from './逻辑/WebSocket处理.js';
import { 生成猫咪, 生成通用, 生成SingBox } from './逻辑/配置生成器.js';
import { 生成登录注册界面 } from './界面_登录注册/模板.js';
import { 生成订阅页面 } from './界面_面板/模板.js';
import { 生成KV未绑定提示页面 } from './界面_KV提示/模板.js';

// ====================== 主逻辑 ======================
export async function 路由处理(请求, env) {
  try {
    if (!env.KV数据库) {
      return 创建HTML响应(生成KV未绑定提示页面());
    }

    const 请求头 = 请求.headers.get('Upgrade');
    const url = new URL(请求.url);
    const hostName = 请求.headers.get('Host');
    const UA = 请求.headers.get('User-Agent') || 'unknown';
    const IP = 请求.headers.get('CF-Connecting-IP') || 'unknown';
    const 设备标识 = `${UA}_${IP}`;
    let formData;

    if (请求头 && 请求头 === 'websocket') {
      共享状态.反代地址 = (await env.KV数据库.get('proxyIP')) || env.PROXYIP || 共享状态.反代地址;
      共享状态.SOCKS5账号 = (await env.KV数据库.get('socks5')) || env.SOCKS5 || 共享状态.SOCKS5账号;
      return await 升级请求(请求, env);
    }

    if (url.pathname === '/login/submit' || url.pathname === '/register/submit') {
      const contentType = 请求.headers.get('Content-Type') || '';
      if (!contentType.includes('application/x-www-form-urlencoded') && !contentType.includes('multipart/form-data')) {
        console.log(`无效请求: UA=${UA}, IP=${IP}, Path=${url.pathname}, Headers=${JSON.stringify([...请求.headers])}`);
        return 创建HTML响应(生成登录注册界面(url.pathname === '/login/submit' ? '登录' : '注册', {
          错误信息: '请通过正常表单提交'
        }), 400);
      }

      try {
        formData = await 请求.formData();
      } catch (错误) {
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

      const 已有用户 = await env.KV数据库.get('stored_credentials');
      if (已有用户) {
        return 创建重定向响应('/login');
      }

      const 加密密码值 = await 加密密码(密码);
      await env.KV数据库.put('stored_credentials', JSON.stringify({
        用户名, 密码: 加密密码值
      }));

      const 新Token = Math.random().toString(36).substring(2);
      await env.KV数据库.put('current_token', 新Token, { expirationTtl: 300 });
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

      const 存储凭据 = await env.KV数据库.get('stored_credentials');
      if (!存储凭据) {
        return 创建重定向响应('/register');
      }

      const 输入用户名 = formData.get('username');
      const 输入密码 = formData.get('password');

      const 凭据对象 = JSON.parse(存储凭据 || '{}');
      const 密码匹配 = (await 加密密码(输入密码)) === 凭据对象.密码;
      if (输入用户名 === 凭据对象.用户名 && 密码匹配) {
        const 新Token = Math.random().toString(36).substring(2);
        await env.KV数据库.put('current_token', 新Token, { expirationTtl: 300 });
        await env.KV数据库.put(`fail_${设备标识}`, '0');
        return 创建重定向响应(`/${共享状态.配置路径}`, {
          'Set-Cookie': `token=${新Token}; Path=/; HttpOnly; SameSite=Strict`
        });
      }

      let 失败次数 = Number(await env.KV数据库.get(`fail_${设备标识}`) || 0) + 1;
      await env.KV数据库.put(`fail_${设备标识}`, String(失败次数));

      if (失败次数 >= 共享状态.最大失败次数) {
        await env.KV数据库.put(`lock_${设备标识}`, String(Date.now() + 共享状态.锁定时间), { expirationTtl: 300 });
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

    const 是否已注册 = await env.KV数据库.get('stored_credentials');
    if (!是否已注册 && url.pathname !== '/register') {
      return 创建HTML响应(生成登录注册界面('注册'));
    }

    switch (url.pathname) {
      case '/login':
        const 存储凭据 = await env.KV数据库.get('stored_credentials');
        if (!存储凭据) {
          return 创建重定向响应('/register');
        }

        const 锁定状态 = await 检查锁定(env, 设备标识);
        if (锁定状态.被锁定) {
          return 创建HTML响应(生成登录注册界面('登录', { 锁定状态: true, 剩余时间: 锁定状态.剩余时间 }));
        }
        if (请求.headers.get('Cookie')?.split('=')[1] === await env.KV数据库.get('current_token')) {
          return 创建重定向响应(`/${共享状态.配置路径}`);
        }
        const 失败次数 = Number(await env.KV数据库.get(`fail_${设备标识}`) || 0);
        return 创建HTML响应(生成登录注册界面('登录', { 输错密码: 失败次数 > 0, 剩余次数: 共享状态.最大失败次数 - 失败次数 }));

      case '/reset-login-failures':
        await env.KV数据库.put(`fail_${设备标识}`, '0');
        await env.KV数据库.delete(`lock_${设备标识}`);
        return new Response(null, { status: 200 });

      case '/check-lock':
        const 锁定检查 = await 检查锁定(env, 设备标识);
        return 创建JSON响应({
          locked: 锁定检查.被锁定,
          remainingTime: 锁定检查.剩余时间
        });

      case `/${共享状态.配置路径}`:
        const Token = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效Token = await env.KV数据库.get('current_token');
        if (!Token || Token !== 有效Token) return 创建重定向响应('/login');
        const uuid = await 获取或初始化UUID(env);
        return 创建HTML响应(生成订阅页面(共享状态.配置路径, hostName, uuid));

      case `/${共享状态.配置路径}/logout`:
        await env.KV数据库.delete('current_token');
        return 创建重定向响应('/login', { 'Set-Cookie': 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict' });

      case `/${共享状态.配置路径}/` + atob('Y2xhc2g='): {
        if (!(await 验证订阅Token(env, hostName, url))) return 创建JSON响应({ error: 'Token无效或缺失' }, 403);
        await 加载节点和配置(env, hostName);
        const config = await 获取配置(env, atob('Y2xhc2g='), hostName);
        const 机场名称 = await env.KV数据库.get('airportName') || '樱花订阅';
        const cleanAirportName = 机场名称.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '');
        const 流量头 = await 获取流量信息头(env);
        return new Response(config, {
          status: 200,
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
            "Content-Disposition": `inline; filename="${cleanAirportName}"; filename*=utf-8''${encodeURIComponent(cleanAirportName)}`,
            ...流量头
          }
        });
      }

      case `/${共享状态.配置路径}/` + atob('djJyYXk='): {
        if (!(await 验证订阅Token(env, hostName, url))) return 创建JSON响应({ error: 'Token无效或缺失' }, 403);
        await 加载节点和配置(env, hostName);
        const 通用配置 = await 获取配置(env, atob('djJyYXk='), hostName);
        const 机场名称v2 = await env.KV数据库.get('airportName') || '樱花订阅';
        const cleanAirportNamev2 = 机场名称v2.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '');
        const 流量头v2 = await 获取流量信息头(env);
        return new Response(通用配置, {
          status: 200,
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
            "Content-Disposition": `inline; filename="${cleanAirportNamev2}"; filename*=utf-8''${encodeURIComponent(cleanAirportNamev2)}`,
            ...流量头v2
          }
        });
      }

      case `/${共享状态.配置路径}/` + atob('djJyYXluZw=='): {
        if (!(await 验证订阅Token(env, hostName, url))) return 创建JSON响应({ error: 'Token无效或缺失' }, 403);
        await 加载节点和配置(env, hostName);
        const 手机通用配置 = await 获取配置(env, atob('djJyYXk='), hostName);
        const 机场名称ng = await env.KV数据库.get('airportName') || '樱花订阅';
        const cleanAirportNameng = 机场名称ng.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '');
        const 流量头ng = await 获取流量信息头(env);
        return new Response(手机通用配置, {
          status: 200,
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
            "Content-Disposition": `attachment; filename="${cleanAirportNameng}"; filename*=utf-8''${encodeURIComponent(cleanAirportNameng)}`,
            ...流量头ng
          }
        });
      }

      case `/${共享状态.配置路径}/` + atob('c2luZ2JveA=='): {
        if (!(await 验证订阅Token(env, hostName, url))) return 创建JSON响应({ error: 'Token无效或缺失' }, 403);
        await 加载节点和配置(env, hostName);
        const singbox配置 = await 生成SingBox(env, hostName);
        const sb机场名称 = await env.KV数据库.get('airportName') || '樱花订阅';
        const cleanSbName = sb机场名称.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '');
        const 流量头sb = await 获取流量信息头(env);
        return new Response(singbox配置, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `inline; filename="${cleanSbName}"; filename*=utf-8''${encodeURIComponent(cleanSbName)}`,
            ...流量头sb
          }
        });
      }

      case `/${共享状态.配置路径}/` + atob('djJyYXlu'): {
        if (!(await 验证订阅Token(env, hostName, url))) return 创建JSON响应({ error: 'Token无效或缺失' }, 403);
        await 加载节点和配置(env, hostName);
        const 电脑通用配置 = await 获取配置(env, atob('djJyYXk='), hostName);
        const 机场名称n = await env.KV数据库.get('airportName') || '樱花订阅';
        const cleanAirportNamen = 机场名称n.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, '');
        const 流量头n = await 获取流量信息头(env);
        return new Response(电脑通用配置, {
          status: 200,
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
            "Content-Disposition": `attachment; filename="${cleanAirportNamen}"; filename*=utf-8''${encodeURIComponent(cleanAirportNamen)}`,
            ...流量头n
          }
        });
      }

      case `/${共享状态.配置路径}/upload`:
        const uploadToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效UploadToken = await env.KV数据库.get('current_token');
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
              const standardPort = port || '443'; // 默认端口443
              const standardizedLine = `${address}:${standardPort}#${nodeName}@${protocol}`;
              validLines.push(standardizedLine);
            }

            if (validLines.length === 0) {
              throw new Error(`文件 ${ipFile.name} 中没有符合格式要求的节点`);
            }

            console.log(`文件 ${ipFile.name} 验证通过，有效节点数: ${validLines.length}`);
            allIpList = allIpList.concat(validLines);
          }
          if (allIpList.length === 0) {
            return 创建JSON响应({ error: '所有上传文件中没有符合格式要求的节点' }, 400);
          }
          const uniqueIpList = [...new Set(allIpList)];

          const 当前手动节点 = await env.KV数据库.get('manual_preferred_ips');
          const 当前节点列表 = 当前手动节点 ? JSON.parse(当前手动节点) : [];
          const 是重复上传 = JSON.stringify(当前节点列表.sort()) === JSON.stringify(uniqueIpList.sort());
          if (是重复上传) {
            return 创建JSON响应({ message: '上传内容与现有节点相同，无需更新' }, 200);
          }

          await env.KV数据库.put('manual_preferred_ips', JSON.stringify(uniqueIpList));
          const 新版本 = String(Date.now());
          await env.KV数据库.put('ip_preferred_ips_version', 新版本);
          await env.KV数据库.put('config_' + atob('Y2xhc2g='), await 生成猫咪(env, hostName));
          await env.KV数据库.put('config_' + atob('Y2xhc2g=') + '_version', 新版本);
          await env.KV数据库.put('config_' + atob('djJyYXk='), await 生成通用(env, hostName));
          await env.KV数据库.put('config_' + atob('djJyYXk=') + '_version', 新版本);
          return 创建JSON响应({ message: '上传成功，即将跳转' }, 200, { 'Location': `/${共享状态.配置路径}` });
        } catch (错误) {
          console.error(`上传处理失败: ${错误.message}`);
          return 创建JSON响应({ error: `上传处理失败: ${错误.message}` }, 500);
        }

      case `/${共享状态.配置路径}/change-uuid`:
        const changeToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效ChangeToken = await env.KV数据库.get('current_token');
        if (!changeToken || changeToken !== 有效ChangeToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const 新UUID = 生成UUID();
        await env.KV数据库.put('current_uuid', 新UUID);
        await env.KV数据库.put('config_' + atob('Y2xhc2g='), await 生成猫咪(env, hostName));
        await env.KV数据库.put('config_' + atob('djJyYXk='), await 生成通用(env, hostName));
        const 新版本 = String(Date.now());
        await env.KV数据库.put('config_' + atob('Y2xhc2g=') + '_version', 新版本);
        await env.KV数据库.put('config_' + atob('djJyYXk=') + '_version', 新版本);
        return 创建JSON响应({ uuid: 新UUID }, 200);

      case `/${共享状态.配置路径}/add-node-path`:
        const addToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效AddToken = await env.KV数据库.get('current_token');
        if (!addToken || addToken !== 有效AddToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const addData = await 请求.json();
        const newPath = addData.path;
        if (!newPath || !newPath.match(/^https?:\/\//)) {
          return 创建JSON响应({ error: '无效的URL格式' }, 400);
        }
        let currentPaths = await env.KV数据库.get('node_file_paths');
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
        await env.KV数据库.put('node_file_paths', JSON.stringify(currentPaths));
        // 清理所有缓存，强制实时重新拉取并生成订阅配置
        await env.KV数据库.delete('ip_preferred_ips');
        await env.KV数据库.delete('ip_preferred_ips_version');
        await env.KV数据库.delete('config_' + atob('Y2xhc2g='));
        await env.KV数据库.delete('config_' + atob('Y2xhc2g=') + '_version');
        await env.KV数据库.delete('config_' + atob('djJyYXk='));
        await env.KV数据库.delete('config_' + atob('djJyYXk=') + '_version');
        await 加载节点和配置(env, hostName);
        const 最终节点 = await env.KV数据库.get('ip_preferred_ips');
        const 总节点数 = 最终节点 ? JSON.parse(最终节点).length : 0;
        return 创建JSON响应({ success: true, 消息: 拉取状态 + '；当前总节点数 ' + 总节点数 }, 200);

      case `/${共享状态.配置路径}/remove-node-path`:
        const removeToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效RemoveToken = await env.KV数据库.get('current_token');
        if (!removeToken || removeToken !== 有效RemoveToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const removeData = await 请求.json();
        const index = removeData.index;
        let paths = await env.KV数据库.get('node_file_paths');
        paths = paths ? JSON.parse(paths) : ['https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt', 'https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt'];
        if (index < 0 || index >= paths.length) {
          return 创建JSON响应({ error: '无效的索引' }, 400);
        }
        paths.splice(index, 1);
        await env.KV数据库.put('node_file_paths', JSON.stringify(paths));
        await env.KV数据库.delete('ip_preferred_ips');
        await env.KV数据库.delete('ip_preferred_ips_version');
        await env.KV数据库.delete('config_' + atob('Y2xhc2g='));
        await env.KV数据库.delete('config_' + atob('Y2xhc2g=') + '_version');
        await env.KV数据库.delete('config_' + atob('djJyYXk='));
        await env.KV数据库.delete('config_' + atob('djJyYXk=') + '_version');
        await 加载节点和配置(env, hostName);
        return 创建JSON响应({ success: true }, 200);

      case `/${共享状态.配置路径}/get-node-paths`:
        const getToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效GetToken = await env.KV数据库.get('current_token');
        if (!getToken || getToken !== 有效GetToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        let nodePaths = await env.KV数据库.get('node_file_paths');
        nodePaths = nodePaths ? JSON.parse(nodePaths) : ['https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/ips.txt', 'https://raw.githubusercontent.com/Alien-Et/SakuraPanel/refs/heads/main/url.txt'];
        return 创建JSON响应({ paths: nodePaths }, 200);

      case '/set-proxy-state':
        formData = await 请求.formData();
        const proxyEnabled = formData.get('proxyEnabled');
        const proxyType = formData.get('proxyType');
        const forceProxy = formData.get('forceProxy');
        await env.KV数据库.put('proxyEnabled', proxyEnabled);
        await env.KV数据库.put('proxyType', proxyType);
        await env.KV数据库.put('forceProxy', forceProxy);
        // 可选：反代地址和 SOCKS5 账号（表单提交时携带），留空表示使用默认值
        if (formData.has('proxyIP')) {
          const proxyIP = (formData.get('proxyIP') || '').trim();
          await env.KV数据库.put('proxyIP', proxyIP);
          共享状态.反代地址 = proxyIP || env.PROXYIP || 共享状态.反代地址;
        }
        if (formData.has('socks5')) {
          const socks5 = (formData.get('socks5') || '').trim();
          await env.KV数据库.put('socks5', socks5);
          共享状态.SOCKS5账号 = socks5 || env.SOCKS5 || 共享状态.SOCKS5账号;
        }
        return new Response(null, { status: 200 });

      case '/get-proxy-status': {
        const 代理启用 = await env.KV数据库.get('proxyEnabled') === 'true';
        const 代理类型 = await env.KV数据库.get('proxyType') || 'reverse';
        const 强制代理 = await env.KV数据库.get('forceProxy') === 'true';
        const 当前反代地址 = (await env.KV数据库.get('proxyIP')) || env.PROXYIP || 共享状态.反代地址;
        const SOCKS5账号 = (await env.KV数据库.get('socks5')) || env.SOCKS5 || '';
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
        const proxyEnabled = await env.KV数据库.get('proxyEnabled') === 'true';
        const proxyType = await env.KV数据库.get('proxyType') || 'reverse';
        const forceProxy = await env.KV数据库.get('forceProxy') === 'true';
        const proxyIP = await env.KV数据库.get('proxyIP') || '';
        const socks5 = await env.KV数据库.get('socks5') || '';
        return 创建JSON响应({ proxyEnabled, proxyType, forceProxy, proxyIP, socks5 });
      }

      case '/set-b64-state':
        formData = await 请求.formData();
        const b64Enabled = formData.get('b64Enabled');
        await env.KV数据库.put('b64Enabled', b64Enabled);
        return new Response(null, { status: 200 });

      case '/get-b64-status':
        const b64状态 = await env.KV数据库.get('b64Enabled') === 'true';
        return 创建JSON响应({ b64Enabled: b64状态 });

      case '/get-ech-config': {
        const echToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效EchToken = await env.KV数据库.get('current_token');
        if (!echToken || echToken !== 有效EchToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const echEnabled = await env.KV数据库.get('echEnabled') === 'true';
        const echSNI = await env.KV数据库.get('echSNI') || '';
        const echDNS = await env.KV数据库.get('echDNS') || 'https://dns.alidns.com/dns-query';
        return 创建JSON响应({ echEnabled, echSNI, echDNS });
      }

      case '/set-ech-state': {
        const stateToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效StateToken = await env.KV数据库.get('current_token');
        if (!stateToken || stateToken !== 有效StateToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 请求.formData();
        const echEnabledValue = formData.get('echEnabled') === 'true';
        await env.KV数据库.put('echEnabled', String(echEnabledValue));
        return new Response(null, { status: 200 });
      }

      case '/set-ech-config': {
        const configToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效ConfigToken = await env.KV数据库.get('current_token');
        if (!configToken || configToken !== 有效ConfigToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 请求.formData();
        const sni = (formData.get('echSNI') || '').toString().trim();
        const dns = (formData.get('echDNS') || '').toString().trim() || 'https://dns.alidns.com/dns-query';
        await env.KV数据库.put('echSNI', sni);
        await env.KV数据库.put('echDNS', dns);
        return new Response(null, { status: 200 });
      }

      case '/set-airport-name':
        const airportToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效AirportToken = await env.KV数据库.get('current_token');
        if (!airportToken || airportToken !== 有效AirportToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 请求.formData();
        const airportName = formData.get('airportName') || '樱花订阅';
        await env.KV数据库.put('airportName', airportName);
        return new Response(null, { status: 200 });

      case '/get-airport-name':
        const getAirportToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效GetAirportToken = await env.KV数据库.get('current_token');
        if (!getAirportToken || getAirportToken !== 有效GetAirportToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const currentAirportName = await env.KV数据库.get('airportName') || '樱花订阅';
        return 创建JSON响应({ airportName: currentAirportName });

      case '/set-wallpaper':
        const wallpaperToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效WallpaperToken = await env.KV数据库.get('current_token');
        if (!wallpaperToken || wallpaperToken !== 有效WallpaperToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 请求.formData();
        const lightWallpaper = formData.get('lightWallpaper') || '';
        const darkWallpaper = formData.get('darkWallpaper') || '';
        await env.KV数据库.put('custom_light_bg', lightWallpaper);
        await env.KV数据库.put('custom_dark_bg', darkWallpaper);
        return 创建JSON响应({ success: true });

      case '/get-wallpaper':
        const getWallpaperToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效GetWallpaperToken = await env.KV数据库.get('current_token');
        if (!getWallpaperToken || getWallpaperToken !== 有效GetWallpaperToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const customLightBg = await env.KV数据库.get('custom_light_bg') || '';
        const customDarkBg = await env.KV数据库.get('custom_dark_bg') || '';
        return 创建JSON响应({ lightWallpaper: customLightBg, darkWallpaper: customDarkBg });

      case '/get-wallpaper-public':
        // 公共API，不需要认证，用于登录/注册界面
        const publicLightBg = await env.KV数据库.get('custom_light_bg') || '';
        const publicDarkBg = await env.KV数据库.get('custom_dark_bg') || '';
        return 创建JSON响应({ lightWallpaper: publicLightBg, darkWallpaper: publicDarkBg });

      case '/reset-wallpaper':
        const resetWallpaperToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效ResetWallpaperToken = await env.KV数据库.get('current_token');
        if (!resetWallpaperToken || resetWallpaperToken !== 有效ResetWallpaperToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        await env.KV数据库.delete('custom_light_bg');
        await env.KV数据库.delete('custom_dark_bg');
        return 创建JSON响应({ success: true });

      case `/${共享状态.配置路径}/generate-cat-config`:
        const catToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效CatToken = await env.KV数据库.get('current_token');
        if (!catToken || catToken !== 有效CatToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        try {
          await 加载节点和配置(env, hostName);
          const catConfig = await 生成猫咪(env, hostName);
          const 新版本 = String(Date.now());
          await env.KV数据库.put('config_' + atob('Y2xhc2g='), catConfig);
          await env.KV数据库.put('config_' + atob('Y2xhc2g=') + '_version', 新版本);
          return 创建JSON响应({ success: true });
        } catch (错误) {
          console.error(`生成猫咪配置失败: ${错误.message}`);
          return 创建JSON响应({ error: `生成猫咪配置失败: ${错误.message}` }, 500);
        }

      case `/${共享状态.配置路径}/generate-universal-config`:
        const universalToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效UniversalToken = await env.KV数据库.get('current_token');
        if (!universalToken || universalToken !== 有效UniversalToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        try {
          await 加载节点和配置(env, hostName);
          const universalConfig = await 生成通用(env, hostName);
          const 新版本 = String(Date.now());
          await env.KV数据库.put('config_' + atob('djJyYXk='), universalConfig);
          await env.KV数据库.put('config_' + atob('djJyYXk=') + '_version', 新版本);
          return 创建JSON响应({ success: true });
        } catch (错误) {
          console.error(`生成通用配置失败: ${错误.message}`);
          return 创建JSON响应({ error: `生成通用配置失败: ${错误.message}` }, 500);
        }

      case '/get-sub-token': {
        const stToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效StToken = await env.KV数据库.get('current_token');
        if (!stToken || stToken !== 有效StToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const subTokenEnabled = await env.KV数据库.get('subTokenEnabled') === 'true';
        const uuid = await env.KV数据库.get('current_uuid');
        const subToken = uuid ? await 生成订阅Token(hostName, uuid) : '';
        return 创建JSON响应({ subTokenEnabled, subToken });
      }

      case '/set-sub-token-state': {
        const stStateToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效StStateToken = await env.KV数据库.get('current_token');
        if (!stStateToken || stStateToken !== 有效StStateToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 请求.formData();
        await env.KV数据库.put('subTokenEnabled', formData.get('subTokenEnabled'));
        return new Response(null, { status: 200 });
      }

      case '/get-cf-credentials': {
        const cfToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效CfToken = await env.KV数据库.get('current_token');
        if (!cfToken || cfToken !== 有效CfToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const accountId = await env.KV数据库.get('cf_account_id') || '';
        const apiToken = await env.KV数据库.get('cf_api_token') || '';
        const email = await env.KV数据库.get('cf_email') || '';
        const globalApiKey = await env.KV数据库.get('cf_global_api_key') || '';
        // 根据是否填入凭证自动判定是否启用请求统计
        const subInfoEnabled = !!(accountId && apiToken) || !!(email && globalApiKey);
        const authMethod = apiToken ? 'token' : (email ? 'email' : 'token');
        return 创建JSON响应({ subInfoEnabled, authMethod, accountId, apiToken, email, globalApiKey });
      }

      case '/set-cf-credentials': {
        const cfSetToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效CfSetToken = await env.KV数据库.get('current_token');
        if (!cfSetToken || cfSetToken !== 有效CfSetToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        formData = await 请求.formData();
        const authMethod = formData.get('authMethod') || 'token';
        const accountId = formData.get('accountId') || '';
        const apiToken = formData.get('apiToken') || '';
        const email = formData.get('email') || '';
        const globalApiKey = formData.get('globalApiKey') || '';
        // 请求统计根据是否填入凭证自动开启：有凭证则开启，无凭证则不开启
        const hasCredentials = (accountId && apiToken) || (email && globalApiKey);
        await env.KV数据库.put('subInfoEnabled', hasCredentials ? 'true' : 'false');
        await env.KV数据库.put('cf_account_id', accountId);
        if (authMethod === 'token') {
          // Token 方式：保存 Token 字段，清空邮箱方式字段
          await env.KV数据库.put('cf_api_token', apiToken);
          await env.KV数据库.delete('cf_email');
          await env.KV数据库.delete('cf_global_api_key');
        } else {
          // 邮箱方式：保存邮箱字段，清空 Token 字段
          await env.KV数据库.delete('cf_api_token');
          await env.KV数据库.put('cf_email', email);
          await env.KV数据库.put('cf_global_api_key', globalApiKey);
        }
        await env.KV数据库.delete('cf_usage_cache');
        return new Response(null, { status: 200 });
      }

      case '/get-cf-usage': {
        const usageToken = 请求.headers.get('Cookie')?.split('=')[1];
        const 有效UsageToken = await env.KV数据库.get('current_token');
        if (!usageToken || usageToken !== 有效UsageToken) {
          return 创建JSON响应({ error: '未登录或Token无效' }, 401);
        }
        const 用量 = await 查询CF请求数(env);
        return 创建JSON响应(用量);
      }

      default:
        url.hostname = 共享状态.伪装域名;
        url.protocol = 'https:';
        return fetch(new Request(url, 请求));
    }
  } catch (error) {
    console.error(`全局错误: ${error.message}`);
    return 创建JSON响应({ error: `服务器内部错误: ${error.message}` }, 500);
  }
}
