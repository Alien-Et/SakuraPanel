const fs = require('fs');
const content = fs.readFileSync('_worker.js', 'utf8');

console.log('=== 界面输入框和状态提示框底色统一检查 ===\n');

// 检查白天模式样式
console.log('🌞 白天模式样式:');
const dayModeStyles = [
  { name: 'URL输入框', pattern: /\.url-input\s*\{[^}]*background-color:\s*rgba\(255,\s*240,\s*245,\s*0\.9\)/ },
  { name: '壁纸输入框', pattern: /\.wallpaper-input\s*\{[^}]*background-color:\s*rgba\(255,\s*240,\s*245,\s*0\.9\)/ },
  { name: '登录表单输入框', pattern: /\.auth-form\s+input\s*\{[^}]*background-color:\s*rgba\(255,\s*240,\s*245,\s*0\.9\)/ },
  { name: '成功状态框', pattern: /\.proxy-status\.success\s*\{[^}]*background:\s*rgba\(255,\s*240,\s*245,\s*0\.9\)/ },
  { name: '直连状态框', pattern: /\.proxy-status\.direct\s*\{[^}]*background:\s*rgba\(255,\s*240,\s*245,\s*0\.9\)/ },
  { name: 'UUID状态框', pattern: /\.uuid-box\s*\{[^}]*background:\s*rgba\(255,\s*240,\s*245,\s*0\.9\)/ },
  { name: '文件要求区域', pattern: /\.file-requirements\s*\{[^}]*background:\s*rgba\(255,\s*240,\s*245,\s*0\.9\)/ }
];

dayModeStyles.forEach(style => {
  const match = content.match(style.pattern);
  console.log(`${match ? '✅' : '❌'} ${style.name}: ${match ? '已统一' : '未统一'}`);
});

console.log('\n🌙 暗黑模式样式:');
const darkModeStyles = [
  { name: '输入框统一', pattern: /\.url-input,\s*\.wallpaper-input,\s*\.auth-form\s+input\s*\{[^}]*background-color:\s*rgba\(50,\s*40,\s*45,\s*0\.9\)/ },
  { name: '状态框统一', pattern: /\.proxy-status\.success,\s*\.proxy-status\.direct,\s*\.uuid-box,\s*\.force-proxy-note,\s*\.file-requirements\s*\{[^}]*background:\s*rgba\(50,\s*40,\s*45,\s*0\.9\)/ }
];

darkModeStyles.forEach(style => {
  const match = content.match(style.pattern);
  console.log(`${match ? '✅' : '❌'} ${style.name}: ${match ? '已统一' : '未统一'}`);
});

console.log('\n=== 检查结果总结 ===');
const allDayUnified = dayModeStyles.every(style => content.match(style.pattern));
const allDarkUnified = darkModeStyles.every(style => content.match(style.pattern));

if (allDayUnified && allDarkUnified) {
  console.log('🎉 所有输入框和状态提示框底色已统一！');
  console.log('白天模式使用: rgba(255, 240, 245, 0.9)');
  console.log('暗黑模式使用: rgba(50, 40, 45, 0.9)');
} else {
  console.log('⚠️  还有部分样式未统一，请检查上述结果');
}