// 部署配置测试脚本
console.log('开始测试部署配置...');

const fs = require('fs');
const path = require('path');

try {
    // 检查index.js文件是否存在
    const indexFilePath = path.join(__dirname, 'index.js');
    const hasIndexFile = fs.existsSync(indexFilePath);
    console.log(`✅ index.js文件存在: ${hasIndexFile}`);
    
    if (hasIndexFile) {
        // 检查文件大小
        const stats = fs.statSync(indexFilePath);
        console.log(`✅ index.js文件大小: ${stats.size} 字节`);
    }
    
    // 检查wrangler.toml文件
    const wranglerFilePath = path.join(__dirname, 'wrangler.toml');
    const hasWranglerConfig = fs.existsSync(wranglerFilePath);
    console.log(`✅ wrangler.toml文件存在: ${hasWranglerConfig}`);
    
    if (hasWranglerConfig) {
        // 读取配置内容
        const wranglerContent = fs.readFileSync(wranglerFilePath, 'utf8');
        console.log('✅ wrangler.toml配置内容验证:');
        
        // 检查main配置
        const mainMatch = wranglerContent.match(/main\s*=\s*["']([^"']+)["']/);
        if (mainMatch) {
            console.log(`  - main入口点: ${mainMatch[1]}`);
        } else {
            console.log('  - ❌ 未找到main配置');
        }
        
        // 检查compatibility_date
        const dateMatch = wranglerContent.match(/compatibility_date\s*=\s*["']([^"']+)["']/);
        if (dateMatch) {
            console.log(`  - compatibility_date: ${dateMatch[1]}`);
        }
        
        // 检查compatibility_flags
        const flagsMatch = wranglerContent.match(/compatibility_flags\s*=\s*\[([^\]]+)\]/);
        if (flagsMatch) {
            console.log(`  - compatibility_flags: [${flagsMatch[1].trim()}]`);
        }
    }
    
    // 检查package.json文件
    const packageFilePath = path.join(__dirname, 'package.json');
    const hasPackageJson = fs.existsSync(packageFilePath);
    
    if (hasPackageJson) {
        const packageContent = JSON.parse(fs.readFileSync(packageFilePath, 'utf8'));
        console.log('✅ package.json验证:');
        console.log(`  - 项目名称: ${packageContent.name}`);
        console.log(`  - 版本: ${packageContent.version}`);
        console.log(`  - 主入口: ${packageContent.main}`);
        
        // 检查脚本命令
        if (packageContent.scripts) {
            console.log('  - 可用脚本:');
            Object.keys(packageContent.scripts).forEach(script => {
                console.log(`    - ${script}: ${packageContent.scripts[script]}`);
            });
        }
    }
    
    console.log('\n部署建议:');
    console.log('1. 确保Cloudflare Workers控制台中已创建同名的Worker');
    console.log('2. 确保KV命名空间已创建并使用实际ID替换wrangler.toml中的示例ID');
    console.log('3. 尝试使用完整命令部署: npx wrangler deploy index.js');
    console.log('4. 如果仍然失败，可以尝试创建wrangler.jsonc文件作为替代配置');
    
} catch (error) {
    console.error('❌ 测试失败:', error);
}

console.log('\n测试完成。');