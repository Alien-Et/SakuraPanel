// 响应工具模块

/**
 * 创建 HTML 响应
 * @param {string} 内容 - HTML 内容
 * @param {number} 状态码 - HTTP 状态码，默认为 200
 * @returns {Response} HTTP 响应对象
 */
export function createHTMLResponse(内容, 状态码 = 200) {
  return new Response(内容, {
    status: 状态码,
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
    }
  });
}

/**
 * 创建重定向响应
 * @param {string} 路径 - 重定向目标路径
 * @param {Object} 额外头 - 额外的 HTTP 头信息
 * @returns {Response} HTTP 响应对象
 */
export function createRedirectResponse(路径, 额外头 = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      "Location": 路径,
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...额外头
    }
  });
}

/**
 * 创建 JSON 响应
 * @param {*} 数据 - 要返回的 JSON 数据
 * @param {number} 状态码 - HTTP 状态码，默认为 200
 * @param {Object} 额外头 - 额外的 HTTP 头信息
 * @returns {Response} HTTP 响应对象
 */
export function createJSONResponse(数据, 状态码 = 200, 额外头 = {}) {
  return new Response(JSON.stringify(数据), {
    status: 状态码,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      ...额外头
    }
  });
}