// 测试按钮颜色统一效果
const fs = require('fs');
const path = require('path');

console.log('🌸 开始验证按钮颜色统一效果...\n');

// 读取_worker.js文件
const workerContent = fs.readFileSync(path.join(__dirname, '_worker.js'), 'utf8');

// 测试项目
const tests = [
  {
    name: '白天模式按钮颜色统一',
    check: () => {
      // 检查是否所有按钮都使用统一的渐变背景
      const buttonGradient = /background:\s*linear-gradient\(to\s+right,\s*#ff69b4,\s*#ff1493\)/g;
      const matches = workerContent.match(buttonGradient);
      return matches && matches.length >= 5; // 至少5个按钮使用统一颜色
    }
  },
  {
    name: '暗黑模式按钮颜色统一',
    check: () => {
      // 检查暗黑模式下的按钮颜色
      const darkModeSection = workerContent.match(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{[\s\S]*?\}/g);
      if (!darkModeSection) return false;
      
      const darkButtonGradient = /background:\s*linear-gradient\(to\s+right,\s*#ff85a2,\s*#ff1493\)/g;
      const matches = darkModeSection[0].match(darkButtonGradient);
      return matches && matches.length >= 3; // 至少3个暗黑模式按钮使用统一颜色
    }
  },
  {
    name: '按钮文字颜色反差',
    check: () => {
      // 检查按钮文字颜色是否为白色，确保与背景形成反差
      const buttonTextColor = /color:\s*white/g;
      const textShadow = /text-shadow:\s*1px\s*1px\s*2px\s*rgba\(0,\s*0,\s*0,\s*0\.[35]\)/g;
      
      const textMatches = workerContent.match(buttonTextColor);
      const shadowMatches = workerContent.match(textShadow);
      
      return textMatches && textMatches.length >= 5 && shadowMatches && shadowMatches.length >= 2;
    }
  },
  {
    name: '登录界面按钮颜色统一',
    check: () => {
      // 检查登录界面按钮是否使用统一颜色
      const loginButtonGradient = /\.auth-form\s+button\s*\{[\s\S]*?background:\s*linear-gradient\(to\s+right,\s*#ff69b4,\s*#ff1493\)/g;
      return loginButtonGradient.test(workerContent);
    }
  },
  {
    name: '移除旧按钮样式类',
    check: () => {
      // 检查是否移除了旧的特殊按钮样式
      const oldStyles = [
        /\.config1-btn\s*\{[\s\S]*?background:/g,
        /\.config2-btn\s*\{[\s\S]*?background:/g,
        /\.logout-btn\s*\{[\s\S]*?background:/g,
        /\.uuid-btn\s*\{[\s\S]*?background:/g
      ];
      
      // 这些样式应该被移除或统一
      return !oldStyles.some(pattern => pattern.test(workerContent) && !workerContent.match(pattern)[0].includes('#ff69b4'));
    }
  },
  {
    name: '暗黑模式文字颜色适配',
    check: () => {
      // 检查暗黑模式下的文字颜色是否适配
      const darkTextColors = [
        /color:\s*#ffffff/g, // 白色文字
        /color:\s*#ffd1dc/g,  // 浅粉色文字
        /color:\s*#ff85a2/g   // 中粉色文字
      ];
      
      return darkTextColors.some(pattern => pattern.test(workerContent));
    }
  }
];

// 执行测试
let passedTests = 0;
let totalTests = tests.length;

tests.forEach((test, index) => {
  const passed = test.check();
  const status = passed ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${test.name}`);
  if (passed) passedTests++;
});

console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 项通过`);

if (passedTests === totalTests) {
  console.log('🎉 所有按钮颜色统一测试均通过！');
  console.log('\n✨ 修复效果:');
  console.log('   • 统一了所有按钮的渐变背景色');
  console.log('   • 白天模式使用 #ff69b4 -> #ff1493 渐变');
  console.log('   • 暗黑模式使用 #ff85a2 -> #ff1493 渐变');
  console.log('   • 按钮文字统一为白色，确保良好反差');
  console.log('   • 添加了文字阴影增强可读性');
  console.log('   • 移除了不同按钮的特殊颜色区分');
} else {
  console.log('⚠️  部分测试未通过，请检查代码');
  process.exit(1);
}