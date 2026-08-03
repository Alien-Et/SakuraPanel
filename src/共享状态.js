// ====================== 共享状态 ======================
// 全局可变状态，所有模块通过 import 共享同一对象
export const 共享状态 = {
  配置路径: "panel",
  优选节点: [],
  反代地址: 'ProxyIP.JP.CMLiussss.net',
  SOCKS5账号: '',
  节点名称: '🌸樱花',
  伪装域名: 'lkssite.vip',
  最大失败次数: 5,
  锁定时间: 5 * 60 * 1000,
  节点加载锁: Promise.resolve()
};
