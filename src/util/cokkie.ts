// 获取所有的 Cookie
export function getCookie(name: string) {
  let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}

/**
 * 设置一个 Cookie
 * @param {string} key - Cookie 名称
 * @param {string} value - Cookie 值
 * @param {number} [expires] - 过期时间，单位为天（可选）
 * @param {string} [path] - Cookie 的作用路径（可选）
 */
export function setCookie(key: string, value: string, expires = 30, path = '/') {
  const date = new Date();
  date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000); // 设置过期时间

  const expiresStr = `expires=${date.toUTCString()}`; // 转换为 UTC 格式
  const pathStr = `path=${path}`; // 默认路径为根路径

  // 拼接 Cookie 字符串并设置
  document.cookie = `${key}=${value}; ${expiresStr}; ${pathStr}`;
}
