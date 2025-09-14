// 模拟Cloudflare Workers环境中的KV数据库
const mockKV = {
  data: {},
  get: function(key) {
    return this.data[key] || null;
  },
  put: function(key, value) {
    this.data[key] = value;
    return Promise.resolve();
  }
};

// 模拟env对象
const mockEnv = {
  KV数据库: mockKV
};

// 从_worker.js中提取的相关函数
function btoa(str) {
  return Buffer.from(str, 'binary').toString('base64');
}

function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

// 测试b64加密功能
async function testB64Functionality() {
  console.log('开始测试b64加密功能...');
  
  // 设置初始状态为false
  await mockEnv.KV数据库.put('b64Enabled', 'false');
  console.log('1. 设置b64Enabled为false');
  
  // 测试生成通用函数
  const testConfig = '测试配置文本';
  const b64Enabled = await mockEnv.KV数据库.get('b64Enabled') === 'true';
  
  let result;
  if (b64Enabled) {
    result = btoa(unescape(encodeURIComponent(testConfig)));
    console.log('2. 配置已进行Base64加密');
  } else {
    result = testConfig;
    console.log('2. 配置未进行Base64加密');
  }
  
  console.log('原始配置:', testConfig);
  console.log('处理结果:', result);
  
  // 切换状态为true
  await mockEnv.KV数据库.put('b64Enabled', 'true');
  console.log('\n3. 设置b64Enabled为true');
  
  // 再次测试
  const b64Enabled2 = await mockEnv.KV数据库.get('b64Enabled') === 'true';
  
  let result2;
  if (b64Enabled2) {
    result2 = btoa(unescape(encodeURIComponent(testConfig)));
    console.log('4. 配置已进行Base64加密');
  } else {
    result2 = testConfig;
    console.log('4. 配置未进行Base64加密');
  }
  
  console.log('原始配置:', testConfig);
  console.log('处理结果:', result2);
  
  // 验证加密结果
  const decoded = decodeURIComponent(escape(atob(result2)));
  console.log('\n5. 验证加密结果:');
  console.log('解密后配置:', decoded);
  console.log('解密是否成功:', decoded === testConfig ? '是' : '否');
  
  console.log('\n测试完成！');
}

// 运行测试
testB64Functionality().catch(console.error);