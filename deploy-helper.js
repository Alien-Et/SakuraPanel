#!/usr/bin/env node
// 部署辅助脚本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌸 SakuraPanel部署辅助工具 🌸\n');

// 检查Node.js版本
function checkNodeVersion() {
    try {
        const version = execSync('node -v').toString().trim();
        const majorVersion = parseInt(version.substring(1).split('.')[0]);
        console.log(`✅ Node.js版本: ${version}`);
        if (majorVersion < 18) {
            console.warn('⚠️ 警告: 建议使用Node.js 18或更高版本以获得最佳性能');
        }
    } catch (error) {
        console.error('❌ 未找到Node.js，请先安装Node.js 18+');
        process.exit(1);
    }
}

// 检查Wrangler是否安装
function checkWrangler() {
    try {
        const version = execSync('wrangler -v').toString().trim();
        console.log(`✅ Wrangler版本: ${version}`);
        return true;
    } catch (error) {
        console.warn('⚠️ 未找到Wrangler CLI，正在尝试安装...');
        try {
            execSync('npm install -g wrangler', { stdio: 'ignore' });
            console.log('✅ Wrangler安装成功');
            return true;
        } catch (installError) {
            console.error('❌ Wrangler安装失败，请手动安装: npm install -g wrangler');
            return false;
        }
    }
}

// 检查项目文件结构
function checkProjectStructure() {
    console.log('\n📁 检查项目文件结构...');
    
    const requiredFiles = [
        { name: 'index.js', description: '主入口文件' },
        { name: 'wrangler.toml', description: 'Wrangler配置文件' },
        { name: 'package.json', description: '项目依赖配置' }
    ];
    
    let allExists = true;
    
    requiredFiles.forEach(file => {
        const exists = fs.existsSync(path.join(__dirname, file.name));
        if (exists) {
            console.log(`✅ ${file.name} (${file.description})`);
        } else {
            console.error(`❌ ${file.name} (${file.description}) - 未找到`);
            allExists = false;
        }
    });
    
    // 检查是否有wrangler.jsonc作为替代
    if (!fs.existsSync(path.join(__dirname, 'wrangler.toml')) && 
        fs.existsSync(path.join(__dirname, 'wrangler.jsonc'))) {
        console.log(`✅ wrangler.jsonc (替代配置文件)`);
        allExists = true;
    }
    
    return allExists;
}

// 检查KV配置
function checkKvConfig() {
    console.log('\n🔑 检查KV配置...');
    
    const configFiles = ['wrangler.toml', 'wrangler.jsonc'];
    let hasConfig = false;
    
    for (const file of configFiles) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            hasConfig = true;
            const content = fs.readFileSync(filePath, 'utf8');
            
            if (content.includes('example-id-1234567890')) {
                console.warn('⚠️ 警告: 您仍在使用示例KV命名空间ID');
                console.warn('   请使用以下命令创建KV命名空间:');
                console.warn('   wrangler kv:namespace create "KV数据库"');
                console.warn('   然后将生成的ID替换配置文件中的example-id-1234567890');
            } else {
                console.log('✅ KV命名空间ID已配置');
            }
            break;
        }
    }
    
    if (!hasConfig) {
        console.error('❌ 未找到配置文件，无法检查KV配置');
    }
}

// 提供部署命令建议
function provideDeploymentCommands() {
    console.log('\n🚀 部署命令建议:');
    console.log('\n1. 登录Cloudflare:');
    console.log('   wrangler login');
    
    console.log('\n2. 创建KV命名空间:');
    console.log('   wrangler kv:namespace create "KV数据库"');
    console.log('   # 将生成的ID替换到配置文件中');
    
    console.log('\n3. 构建项目:');
    console.log('   npm run build');
    
    console.log('\n4. 部署项目 (选择一种方法):');
    console.log('   a) 使用npm脚本:');
    console.log('      npm run deploy');
    console.log('   b) 直接指定入口文件:');
    console.log('      wrangler deploy index.js');
    console.log('   c) 部署构建后的文件:');
    console.log('      wrangler deploy dist/index.js');
    
    console.log('\n5. 开发环境配置指南:');
    console.log('   本地开发时，您可以使用模拟KV数据库进行测试:');
    console.log('   - 复制.env.example文件为.env');
    console.log('   - 在.env文件中设置DEVELOPMENT_MODE=true');
    console.log('   - 运行本地开发服务器: wrangler dev');
    console.log('   注意: 模拟KV数据库仅用于开发和测试，生产环境请使用真实的Cloudflare KV命名空间。');
    
    console.log('\n6. 常见问题解决:');
    console.log('   - 部署错误: Missing entry-point to Worker script or to assets directory');
    console.log('     解决方案: 使用命令 wrangler deploy index.js');
    console.log('   - Windows环境下开发服务器启动失败');
    console.log('     解决方案: 使用WSL或直接部署到Cloudflare进行测试');
    console.log('   - KV未绑定错误: 如果遇到KV命名空间绑定错误');
    console.log('     解决方案: 确保在Cloudflare控制台正确绑定了KV命名空间，检查配置文件中的ID是否正确，本地开发时可启用模拟KV数据库');
}

// 执行检查
checkNodeVersion();

if (checkWrangler()) {
    if (checkProjectStructure()) {
        checkKvConfig();
        provideDeploymentCommands();
        
        console.log('\n📝 请参考README.md文件获取详细的部署指南');
        console.log('\n祝部署顺利！🌸');
    } else {
        console.error('\n❌ 项目文件不完整，无法继续部署');
        console.error('   请确保所有必需的文件都已创建');
    }
}

console.log('\n部署辅助工具执行完毕。');