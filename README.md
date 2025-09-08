# SakuraPanel

一个基于Cloudflare Workers的Sakura订阅管理面板。

## 功能特点
- 订阅管理
- 流量统计
- KV数据库支持
- 环境变量配置
- 本地开发支持（模拟KV数据库）

## 安装和配置

### 1. 前提条件
- 安装Node.js 18+ 
- 安装Wrangler CLI：`npm install -g wrangler`
- 拥有Cloudflare账号

### 2. 克隆仓库
```bash
git clone <仓库地址>
cd SakuraPanel
```

### 3. 安装依赖
```bash
npm install
```

### 4. 配置Cloudflare Workers

#### 4.1 登录Wrangler
```bash
wrangler login
```

#### 4.2 创建KV命名空间
```bash
wrangler kv:namespace create "KV数据库"
```

#### 4.3 配置wrangler.toml或wrangler.jsonc

使用生成的KV命名空间ID替换配置文件中的`example-id-1234567890`。

## 本地开发

### 方法1：使用真实Cloudflare KV（推荐生产环境）
确保已正确配置KV命名空间ID，然后运行：
```bash
npm run dev
# 或
wrangler dev
```

### 方法2：使用模拟KV数据库（推荐开发环境）
1. 复制.env.example文件为.env
```bash
cp .env.example .env
```

2. 在.env文件中设置开发模式
```
DEVELOPMENT_MODE=true
```

3. 运行本地开发服务器
```bash
npm run dev
# 或
wrangler dev --env .env
```

**注意**：模拟KV数据库仅用于开发和测试，数据存储在内存中，重启服务器后会丢失。生产环境请使用真实的Cloudflare KV命名空间。

## 部署指南

### 方法1：使用npm脚本
```bash
npm run deploy
```

### 方法2：直接使用wrangler命令
```bash
# 指定入口文件部署
wrangler deploy index.js

# 或使用构建后的文件
wrangler deploy dist/index.js
```

### 方法3：通过Cloudflare Dashboard上传
1. 构建项目：`npm run build`
2. 登录Cloudflare Dashboard
3. 导航到Workers & Pages
4. 创建新的Worker
5. 上传dist/index.js文件内容
6. 配置KV命名空间绑定
7. 配置环境变量
8. 部署

## 环境变量配置

在wrangler.toml或Cloudflare Dashboard中设置以下环境变量：

- `PROXYIP`：代理IP地址，默认为"ts.hpc.tw"
- `SOCKS5`：SOCKS5代理配置（可选）
- `DEVELOPMENT_MODE`：设置为"true"启用开发模式，使用模拟KV数据库

## 常见问题解决

### 部署错误：Missing entry-point to Worker script or to assets directory

**问题原因**：Wrangler无法找到Worker的入口文件。

**解决方案**：
1. 确保`wrangler.toml`或`wrangler.jsonc`文件中正确配置了`main`字段，指向`index.js`
2. 使用完整命令部署：`wrangler deploy index.js`
3. 检查项目根目录是否存在`index.js`文件

### Windows环境下wrangler dev启动失败

**问题原因**：Windows环境与Wrangler某些版本存在兼容性问题。

**解决方案**：
1. 更新Wrangler到最新版本：`npm install wrangler@latest -D`
2. 使用WSL(Windows Subsystem for Linux)进行开发
3. 直接部署到Cloudflare进行测试
4. 使用模拟KV数据库进行本地开发

### KV数据库未绑定错误

**问题原因**：KV命名空间ID配置错误或未在Cloudflare中创建。

**解决方案**：
1. 确认在Cloudflare中创建了KV命名空间
2. 使用正确的KV命名空间ID更新配置文件
3. 检查KV命名空间的绑定名称是否为"KV数据库"
4. 本地开发时可启用模拟KV数据库

## 开发说明

- 项目使用ES Modules语法
- 主要逻辑位于`index.js`文件
- 辅助函数位于`utils/`目录
- 构建输出在`dist/`目录

## 注意事项
- 本项目的默认KV命名空间ID为示例值，请务必替换为您自己的实际ID
- 在生产环境中，请确保所有敏感信息都配置为环境变量
- 定期备份KV数据库中的数据

## 许可证
MIT
