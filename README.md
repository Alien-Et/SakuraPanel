# 樱花面板增强版 - 详细使用说明
#### ⚠️注意！！使用中国移动网络，如果不套自定义域名，包你timeout！因为pages.dev已经被移动屏蔽。workers域名你们自行测试(我没测试)。
#### ⚠️目前已知中国联通可以正常使用！！
#### ⚠️中国电信请自行测试，我没条件测！


#### 樱花面板主界面一览(只要把KV空间设置好了后，基本上除了所有操作都能在webui操作，不需要到cloudflare后台设置环境变量。)

![IMG_20250410_064307](https://github.com/user-attachments/assets/d1293b0d-0d84-4ff8-a7ab-0105d07afd97)
![Screenshot_2025-04-10-03-28-54-46_df198e732186825c8df26e3c5a10d7cd](https://github.com/user-attachments/assets/88fd0997-7237-42d0-95c9-38592f1ce764)
![IMG_20250410_064343](https://github.com/user-attachments/assets/27d8759e-db73-41f6-a2a6-7f0f631269e5)
![Screenshot_2025-04-10-02-29-05-40_ed7cc6eecf382e65e95dbc137f8c2558](https://github.com/user-attachments/assets/cfb986e4-0813-46c4-b54a-1cda7f7522e5)

“樱花面板增强版”是一个基于 Cloudflare Workers 和 Pages 的订阅管理工具，支持 Clash 和 v2rayN 配置生成，提供用户认证、节点管理、代理设置和文件上传功能。本文档详细介绍部署、使用、配置，尤其是 IP 格式的说明，适用于开源仓库分享。

## 功能概述

### 用户认证
- **注册**：首次使用需注册，用户名（4-20位字母数字），密码（至少6位）。
- **登录**：输入用户名和密码，失败5次锁定5分钟。
- **会话管理**：通过 Cookie 和 Token（有效期5分钟）确保安全。

### 节点管理
- **自动拉取**：从指定 URL（如 `ips.txt` 和 `url.txt`）获取节点。
- **手动上传**：支持 `.txt` 文件自定义节点。
- **缓存**：节点和配置存储在 KV 中，优化性能。

### 代理设置
- **模式**：
  - 直连：不使用代理。
  - 动态代理：优先直连，失败时切换反代或 SOCKS5。
  - 强制代理：固定使用反代或 SOCKS5。
- **类型**：反代（默认 `ts.hpc.tw`）或 SOCKS5（需配置账号）。

### 订阅生成
- **支持客户端**：Clash 和 v2rayN。
- **UUID**：可手动更换，确保唯一性。
- **一键导入**：生成订阅链接并支持客户端导入。

### 界面设计
- **风格**：可爱风，响应式布局。
- **主题**：支持明暗模式，背景图自动切换。
- **交互**：代理开关、文件上传进度条等。

### WebSocket 支持
- 处理 WebSocket 请求，支持 vless 协议代理连接。

## 部署步骤

支持 Cloudflare Workers 和 Pages，以下分别说明。

### 前置条件
- Cloudflare 账户。
- 已创建 Workers 或 Pages 项目。
- 一个 KV 命名空间。

### 部署到 Cloudflare Workers

1. **创建 KV 存储空间**：
   - 登录 Cloudflare 仪表盘，进入 `Workers & Pages` > `KV`。
   - 点击 `Create a namespace`，命名（如 `LOGIN_STATE`），记录 ID。
   - 在 Workers 项目 `Settings` > `KV`，绑定：
     - Variable name: `LOGIN_STATE`
     - Namespace: 选择 `LOGIN_STATE`

2. **创建 Workers 项目**：
   - 在 `Workers & Pages` > `Overview` 点击 `Create Worker`。
   - 命名（如 `sakura-panel`），点击 `Create`。

3. **部署脚本**：
   - 将 `樱花面板增强版.txt` 完整代码粘贴到编辑器。
   - 点击 `Save and Deploy`。

4. **配置环境变量（可选）**：
   - 在 `Settings` > `Variables` > `Environment Variables` 添加：
     - `PROXYIP`：反代地址，如 `example.com:443`。
     - `SOCKS5`：SOCKS5 账号，如 `user:pass@host:port`。
   - 保存并部署。

5. **绑定域名（可选）**：
   - 在 `Triggers` > `Custom Domains` 添加域名（如 `sakura.yourdomain.com`）。
   - 确保域名通过 Cloudflare DNS 解析。

6. **测试访问**：
   - 访问 URL（如 `https://sakura-panel.your-subdomain.workers.dev`）。
   - 未绑定 KV 显示提示，绑定后进入注册页面。

### 部署到 Cloudflare Pages

1. **创建 Pages 项目**：
   - 在 `Workers & Pages` > `Pages` 点击 `Create a project`。
   - 选择 `Connect to a Git repository`（推荐 GitHub）。
   - 创建仓库，将 `樱花面板增强版.txt` 重命名为 `index.js` 并上传。

2. **配置 KV 绑定**：
   - 创建 KV 命名空间（如上）。
   - 在 Pages 项目 `Settings` > `Functions` > `KV namespace bindings` 添加：
     - Variable name: `LOGIN_STATE`
     - Namespace: 选择 `LOGIN_STATE`

3. **设置环境变量（可选）**：
   - 在 `Settings` > `Environment variables` 添加：
     - `PROXYIP`：反代地址。
     - `SOCKS5`：SOCKS5 账号。
   - 保存并部署。

4. **部署 Pages**：
   - 在 `Build settings` 中：
     - Build command: 留空。
     - Build output directory: `/`。
   - 点击 `Save and Deploy`。
   - 访问 URL（如 `https://sakura-panel.pages.dev`）。

5. **注意事项**：
   - Pages 使用 Functions，脚本需为 `index.js`。
   - 通过 Git 更新代码。

## 使用方法

### 1. 注册与登录
- **注册**：
  - 访问根路径（`/`），进入注册页面。
  - 用户名：4-20位，仅字母数字。
  - 密码：至少6位，确认密码一致。
  - 点击“立即注册”，跳转至 `/config`。
- **登录**：
  - 访问 `/login`，输入用户名和密码。
  - 失败5次锁定5分钟，倒计时显示。

### 2. 订阅页面（`/config`）
- **UUID 管理**：
  - 显示当前 UUID，点击“更换 UUID”生成新值。
- **代理设置**：
  - **代理开关**：开启/关闭。
  - **强制代理**：开启后固定代理。
  - **代理类型**：选择“反代”或“SOCKS5”。
  - 状态：如“直连”、“动态反代”。
- **订阅链接**：
  - **Clash**：`https://your-domain/config/clash`。
  - **v2rayN**：`https://your-domain/config/v2rayn`。
  - 点击“一键导入”打开客户端。
- **上传节点**：
  - 点击“选择文件”，支持多选 `.txt`。
  - 显示文件列表，可移除。
  - 点击“上传”，进度条显示，成功后刷新。

### 3. 节点文件格式（IP 格式详细说明）

节点文件（`.txt`）每行定义一个节点，格式为：
```
地址:端口#节点名称@tls选项
```
- **地址**：支持 IPv4、IPv6 或域名。
- **端口**：可选，默认 443。
- **节点名称**：可选，默认“🌸樱花”。
- **tls选项**：`@tls`（默认）或 `@notls`。

#### IP 格式详细解释

1. **IPv4**：
   - **格式**：`x.x.x.x:port#名称@tls选项`
   - **说明**：点分十进制表示的 IP 地址，4组数字（0-255），用点分隔。
   - **示例**：
     - `1.2.3.4:443#CN-节点1`：IPv4 地址 `1.2.3.4`，端口 443，名称“CN-节点1”，默认 TLS。
     - `192.168.1.1`：简写，端口默认 443，名称“🌸樱花”，TLS 启用。
     - `10.0.0.1:80#JP-节点2@notls`：端口 80，禁用 TLS。
   - **注意**：
     - 地址必须是有效的 IPv4，不含 `[]`。
     - 端口范围 1-65535。

2. **IPv6**：
   - **格式**：`[xxxx:xxxx::xxxx]:port#名称@tls选项`
   - **说明**：16进制表示，8组（每组4位），用冒号分隔，需用 `[]` 包裹避免歧义。
   - **示例**：
     - `[2001:db8::1]:443#JP-节点1`：IPv6 地址，端口 443，名称“JP-节点1”，TLS 启用。
     - `[::1]`：简写（本地回环地址），端口 443，名称“🌸樱花”。
     - `[2001:db8:85a3::8a2e]:8443#US-节点2@notls`：端口 8443，禁用 TLS。
   - **注意**：
     - 必须用 `[]` 包裹，否则解析失败。
     - 支持缩写（如 `::1` 表示全零地址）。
     - 确保客户端支持 IPv6。

3. **域名**：
   - **格式**：`domain.com:port#名称@tls选项`
   - **说明**：由字母、数字、连字符和点组成的域名，不含 `[]`。
   - **示例**：
     - `example.com:443#CN-节点3`：域名 `example.com`，端口 443，名称“CN-节点3”。
     - `test.org`：简写，端口 443，名称“🌸樱花”。
     - `sub.domain.com:8443#US-节点4@notls`：子域名，端口 8443，禁用 TLS。
   - **注意**：
     - 域名需可解析到 IP。
     - 支持多级域名（如 `a.b.c.com`）。

#### 字段说明
- **地址**：
  - IPv4：如 `1.2.3.4`。
  - IPv6：如 `[2001:db8::1]`。
  - 域名：如 `example.com`。
- **端口**：
  - 范围：1-65535。
  - 默认：443（若省略）。
  - 示例：`:80`、`:8443`。
- **节点名称**：
  - 自定义名称，用于区分节点。
  - 默认：`🌸樱花`。
  - 支持emoji和多语言，如 `#CN-节点1`。
- **TLS选项**：
  - `@tls`：启用 TLS（默认）。
  - `@notls`：禁用 TLS。
  - 省略时默认 `@tls`。

#### 完整文件示例
```
1.2.3.4:443#CN-节点1@tls
192.168.1.1#节点2
[2001:db8::1]:80#JP-节点3@notls
[::ffff:192.168.1.2]:8443#US-节点4
example.com:443#CN-节点5
test.org#节点6@notls
```

#### 解析逻辑
- 脚本通过正则表达式解析：
  - IPv6：检测 `[]` 包裹的地址。
  - IPv4：检测点分十进制。
  - 域名：非 IP 格式的字符串。
- 错误格式（如 `[1.2.3.4]` 或 `example:com`）会被忽略。

#### 注意事项
- **空格**：每行不能有空格，需紧凑。
- **唯一性**：重复地址会被去重。
- **兼容性**：确保客户端支持指定的 IP 类型和 TLS 设置。

### 4. 退出登录
- 点击“退出登录”，清除 Cookie 和 Token，返回登录页面。

## 配置项说明

脚本顶部定义了以下变量：

- **`配置路径`**：`let 配置路径 = "config";`
  - 默认 `/config`，可改为 `/sub`。
- **`节点文件路径`**：
  ```
  let 节点文件路径 = [
    'https://v2.i-sweet.us.kg/ips.txt',
    'https://v2.i-sweet.us.kg/url.txt'
  ];
  ```
  - 支持多个 URL，拉取节点列表。
- **`反代地址`**：`let 反代地址 = 'ts.hpc.tw';`
  - 默认反代，可通过 `PROXYIP` 覆盖。
- **`SOCKS5账号`**：`let SOCKS5账号 = '';`
  - 默认空，格式 `user:pass@host:port`。
- **`节点名称`**：`let 节点名称 = '🌸樱花';`
  - 默认名称。
- **`伪装域名`**：`let 伪装域名 = 'lkssite.vip';`
  - 用于伪装请求。
- **`最大失败次数`**：`let 最大失败次数 = 5;`
  - 登录失败锁定阈值。
- **`锁定时间`**：`let 锁定时间 = 5 * 60 * 1000;`
  - 默认5分钟（毫秒）。
- **`白天背景图`** / **`暗黑背景图`**：
  - 默认图片 URL，可替换。

## 注意事项

1. **安全性**：
   - 密码 SHA-256 加密，建议强密码。
   - Token 有效期5分钟。
2. **性能**：
   - 节点过多可能影响生成速度。
   - KV 免费配额有限。
3. **兼容性**：
   - Clash 和 v2rayN 需支持 vless over WebSocket。
4. **调试**：
   - Workers：查看 `Real-Time Logs`。
   - Pages：检查部署日志。

## 常见问题解答

### Q1：KV 未绑定怎么办？
- **A**：绑定 `LOGIN_STATE` 到 Workers 或 Pages 设置。

### Q2：IP 格式错误如何排查？
- **A**：
  - IPv4：确保是 `x.x.x.x` 格式。
  - IPv6：检查 `[]` 是否正确。
  - 域名：确认无非法字符。

### Q3：代理不生效？
- **A**：
  - 检查 `PROXYIP` 或 `SOCKS5` 配置。
  - 确保服务器在线。

### Q4：如何自定义背景？
- **A**：替换 `白天背景图` 和 `暗黑背景图` 的 URL。

### Q5：Workers 和 Pages 区别？
- **A**：
  - Workers：即时编辑。
  - Pages：Git 管理。

## 开源贡献

欢迎提交 Pull Request 或 Issues。建议：
- 添加节点延迟测试。
- 支持更多协议。
- 优化 UI。

## 许可

[MIT 许可证](https://opensource.org/licenses/MIT)。

---

这份说明特别强化了 IP 格式的解释，确保用户理解每种格式的用法和注意事项。如需进一步帮助，请在 Issues 中提问！🌸
