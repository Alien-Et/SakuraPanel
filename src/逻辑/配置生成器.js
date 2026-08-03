import { 共享状态 } from '../共享状态.js';
import { 获取或初始化UUID, 加载节点和配置 } from './节点配置.js';

// ====================== 配置生成器 ======================
export async function 生成猫咪(env, hostName) {
  const uuid = await 获取或初始化UUID(env);
  if (!共享状态.优选节点.length) {
    await 加载节点和配置(env, hostName);
  }
  const 节点列表 = 共享状态.优选节点.length ? 共享状态.优选节点 : [`${hostName}:443`];
  // ECH 设置
  const echEnabled = await env.KV数据库.get('echEnabled') !== 'false';
  const echSNI = (await env.KV数据库.get('echSNI')) || '';
  const echDNS = (await env.KV数据库.get('echDNS')) || 'https://dns.alidns.com/dns-query';
  // 获取机场名称，默认为"樱花订阅"
  const 机场名称 = await env.KV数据库.get('airportName') || '樱花订阅';
  const 国家分组 = {};

  节点列表.forEach((节点, 索引) => {
    const [主内容, tls] = 节点.split("@");
    const [地址端口, 节点名字 = 共享状态.节点名称] = 主内容.split("#");
    const [, 地址, 端口 = "443"] = 地址端口.match(/^\[(.*?)\](?::(\d+))?$/) || 地址端口.match(/^(.*?)(?::(\d+))?$/);
    const 修正地址 = 地址.includes(":") ? 地址.replace(/^\[|\]$/g, '') : 地址;
    const TLS开关 = tls === 'notls' ? 'false' : 'true';
    const 国家 = 节点名字.split('-')[0] || '默认';
    const 地址类型 = 修正地址.includes(":") ? "IPv6" : "IPv4";
    // ECH 块（启用时附加）
    const echBlock = echEnabled ? `
  ech-opts:
    enable: true${echSNI ? `
    query-server-name: ${echSNI}` : ''}` : '';

    国家分组[国家] = 国家分组[国家] || { IPv4: [], IPv6: [] };
    国家分组[国家][地址类型].push({
      name: `${节点名字}-${国家分组[国家][地址类型].length + 1}`,
      config: `- name: "${节点名字}-${国家分组[国家][地址类型].length + 1}"
  type: ${atob('dmxlc3M=')}
  server: ${修正地址}
  port: ${端口}
  uuid: ${uuid}
  udp: false
  tls: ${TLS开关}
  sni: ${hostName}${echBlock}
  client-fingerprint: chrome
  network: ws
  ws-opts:
    path: "/?ed=2560"
    headers:
      Host: ${hostName}`
    });
  });

  const 国家列表 = Object.keys(国家分组).sort();
  const 节点配置 = 国家列表.flatMap(国家 => [...国家分组[国家].IPv4, ...国家分组[国家].IPv6].map(n => n.config)).join("\n");
  const 国家分组配置 = 国家列表.map(国家 => `
  - name: "${国家}"
    type: url-test
    url: "http://www.gstatic.com/generate_204"
    interval: 120
    tolerance: 50
    proxies:
${[...国家分组[国家].IPv4, ...国家分组[国家].IPv6].map(n => `      - "${n.name}"`).join("\n")}
`).join("");

  const 配置文本 = `# Generated at: ${new Date().toISOString()}
# Airport: ${机场名称}
mixed-port: 7890
allow-lan: true
mode: Rule
log-level: info
external-controller: :9090
dns:
    enable: true
    listen: 0.0.0.0:53
    default-nameserver:
      - 8.8.8.8
      - 1.1.1.1
    enhanced-mode: fake-ip
    nameserver:
      - https://dns.google/dns-query
      - https://cloudflare-dns.com/dns-query
      - https://dns.alidns.com/dns-query
    fallback:
      - https://dns.google/dns-query
      - https://cloudflare-dns.com/dns-query
    fallback-filter:
      geoip: true
      ipcidr:
        - 240.0.0.0/4
${echEnabled ? `    nameserver-policy:
${echSNI ? `      "${echSNI}": ${echDNS}
` : ''}      "${hostName}": ${echDNS}` : ''}

proxies:
${节点配置}

proxy-groups:
  - name: "🚀节点选择"
    type: select
    proxies:
      - "🤪自动选择"
      - "🥰负载均衡"
${国家列表.map(国家 => `      - "${国家}"`).join("\n")}

  - name: "🤪自动选择"
    type: url-test
    url: "http://www.gstatic.com/generate_204"
    interval: 120
    tolerance: 50
    proxies:
${国家列表.map(国家 => `      - "${国家}"`).join("\n")}

  - name: "🥰负载均衡"
    type: load-balance
    strategy: round-robin
    proxies:
${国家列表.map(国家 => `      - "${国家}"`).join("\n")}

${国家分组配置}

rules:
  - GEOIP,LAN,DIRECT
  - DOMAIN-SUFFIX,cn,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,🚀节点选择
`;

// Clash 客户端只识别 YAML 明文，不支持 Base64 编码的 YAML 配置
return 配置文本;
}

export async function 生成通用(env, hostName) {
  const uuid = await 获取或初始化UUID(env);
  if (!共享状态.优选节点.length) {
    await 加载节点和配置(env, hostName);
  }
  const 节点列表 = 共享状态.优选节点.length ? 共享状态.优选节点 : [`${hostName}:443`];
  const b64Enabled = await env.KV数据库.get('b64Enabled') !== 'false';
  // ECH 设置
  const echEnabled = await env.KV数据库.get('echEnabled') !== 'false';
  const echSNI = (await env.KV数据库.get('echSNI')) || '';
  const echDNS = (await env.KV数据库.get('echDNS')) || 'https://dns.alidns.com/dns-query';
  // ECH 参数：&ech=SNI+DNS  （SNI 为空时省略 SNI+ 部分）
  const echParam = echEnabled ? `&ech=${encodeURIComponent((echSNI ? echSNI + '+' : '') + echDNS)}` : '';
  // 获取机场名称，默认为"樱花订阅"
  const 机场名称 = await env.KV数据库.get('airportName') || '樱花订阅';
  const 配置列表 = 节点列表.map(节点 => {
    try {
      const [主内容, tls = 'tls'] = 节点.split("@");
      const [地址端口, 节点名字 = 共享状态.节点名称] = 主内容.split("#");
      const match = 地址端口.match(/^(?:\[([0-9a-fA-F:]+)\]|([^:]+))(?:\:(\d+))?$/);
      if (!match) return null;
      const 地址 = match[1] || match[2];
      const 端口 = match[3] || "443";
      if (!地址) return null;
      const 修正地址 = 地址.includes(":") ? `[${地址}]` : 地址;
      const TLS开关 = tls === 'notls' ? 'none' : 'tls';
      const encodedPath = encodeURIComponent('/?ed=2560');
      return `${atob('dmxlc3M=')}://${uuid}@${修正地址}:${端口}?encryption=none&security=${TLS开关}&type=ws&host=${hostName}&path=${encodedPath}&sni=${hostName}&fp=chrome${echParam}#${encodeURIComponent(节点名字)}`;
    } catch (error) {
      console.error(`生成通用节点失败: ${节点}, 错误: ${error.message}`);
      return null;
    }
  }).filter(Boolean);

  const 配置文本 = `# Generated at: ${new Date().toISOString()}
# Airport: ${机场名称}
${配置列表.length ? 配置列表.join("\n") : (atob('dmxlc3M=') + '://' + uuid + '@' + hostName + ':443?encryption=none&security=tls&type=ws&host=' + hostName + '&path=' + encodeURIComponent('/?ed=2560') + '&sni=' + hostName + echParam + '#默认节点')}`;

  // 如果启用了Base64加密，则对整个配置文本进行Base64编码
  if (b64Enabled) {
    return btoa(unescape(encodeURIComponent(配置文本)));
  }
  return 配置文本;
}

// ====================== ${atob('U2luZ0JveCDphY3nva7nlJ/miJDlmag=')} ======================
export async function 生成SingBox(env, hostName) {
  const uuid = await 获取或初始化UUID(env);
  if (!共享状态.优选节点.length) {
    await 加载节点和配置(env, hostName);
  }
  const 节点列表 = 共享状态.优选节点.length ? 共享状态.优选节点 : [`${hostName}:443`];
  const echEnabled = await env.KV数据库.get('echEnabled') !== 'false';
  const echSNI = (await env.KV数据库.get('echSNI')) || 'cloudflare-ech.com';
  const 机场名称 = await env.KV数据库.get('airportName') || '樱花订阅';

  // 构建 outbounds（VLESS 节点）
  const outbounds = 节点列表.map(节点 => {
    try {
      const [主内容, tls = 'tls'] = 节点.split("@");
      const [地址端口, 节点名字 = 共享状态.节点名称] = 主内容.split("#");
      const match = 地址端口.match(/^(?:\[([0-9a-fA-F:]+)\]|([^:]+))(?:\:(\d+))?$/);
      if (!match) return null;
      const 地址 = match[1] || match[2];
      const 端口 = match[3] || "443";
      if (!地址) return null;
      const TLS开关 = tls === 'notls' ? false : true;
      const outbound = {
        type: 'vless',
        tag: 节点名字,
        server: 地址,
        server_port: Number(端口),
        uuid: uuid,
        transport: {
          type: 'ws',
          path: '/?ed=2560',
          headers: { Host: hostName }
        }
      };
      if (TLS开关) {
        outbound.tls = {
          enabled: true,
          server_name: hostName,
          utls: { enabled: true, fingerprint: 'chrome' }
        };
        if (echEnabled) {
          outbound.tls.ech = {
            enabled: true,
            query_server_name: echSNI
          };
        }
      }
      return outbound;
    } catch (error) {
      console.error(`${atob('55Sf5oiQIFNpbmdCb3gg6IqC54K55aSx6LSl')}${节点}, 错误: ${error.message}`);
      return null;
    }
  }).filter(Boolean);

  // 默认 outbound
  const 默认出站 = {
    type: 'direct',
    tag: 'direct'
  };

  // 构建 DNS 服务器（DoH 优先 CF 和 Google）
  const dnsServers = [
    { type: 'https', server: 'dns.google', server_port: 443, path: '/dns-query' },
    { type: 'https', server: 'cloudflare-dns.com', server_port: 443, path: '/dns-query' }
  ];

  // 构建路由规则
  const routeRules = [
    { geoip: 'private', outbound: 'direct' },
    { geoip: 'cn', outbound: 'direct' },
    { geosite: 'cn', outbound: 'direct' },
    { network: 'udp', port: [53], outbound: 'direct' },
    { rule_set: ['openai'], outbound: 'proxy' },
    { rule_set: ['netflix'], outbound: 'proxy' },
    { rule_set: ['google'], outbound: 'proxy' },
    { rule_set: ['github'], outbound: 'proxy' },
    { rule_set: ['telegram'], outbound: 'proxy' }
  ];

  const config = {
    log: { level: 'info' },
    dns: {
      servers: dnsServers,
      rules: [
        { domain_suffix: '.cn', server: 'direct' },
        { domain_keyword: ['google', 'github', 'telegram', 'openai', 'netflix'], server: 'proxy' }
      ],
      final: 'proxy'
    },
    outbounds: [ ...outbounds, 默认出站 ],
    route: {
      rules: routeRules,
      final: 'proxy',
      rule_set: [
        { tag: 'openai', type: 'remote', format: 'binary', url: 'https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/openai.srs' },
        { tag: 'netflix', type: 'remote', format: 'binary', url: 'https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/netflix.srs' },
        { tag: 'google', type: 'remote', format: 'binary', url: 'https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/google.srs' },
        { tag: 'github', type: 'remote', format: 'binary', url: 'https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/github.srs' },
        { tag: 'telegram', type: 'remote', format: 'binary', url: 'https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/telegram.srs' }
      ]
    },
    experimental: {
      cache_file: { enabled: true }
    }
  };

  const json = JSON.stringify(config, null, 2);
  // SingBox 客户端只识别 JSON 明文，不支持 Base64 编码
  return json;
}
