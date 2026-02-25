/**
 * 获取本地存储中的值
 * @param {string} key - 存储键名
 * @returns {T | null} 返回存储的值，如果不存在则返回 null
 */
export function getLocalStorage<T>(key: string): T | null {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error getting localStorage item:', error);
        return null;
    }
}

/**
 * 设置本地存储
 * @param {string} key - 存储键名
 * @param {T} value - 要存储的值
 */
export function setLocalStorage<T>(key: string, value: T): void {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error setting localStorage item:', error);
    }
}

/**
 * 删除本地存储中的某个键值对
 * @param {string} key - 要删除的键名
 */
export function removeLocalStorage(key: string): void {
    try {
        window.localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing localStorage item:', error);
    }
}

/**
 * 检查本地存储中是否存在某个键
 * @param {string} key - 要检查的键名
 * @returns {boolean} 如果键存在则返回 true，否则返回 false
 */
export function hasLocalStorage(key: string): boolean {
    try {
        return window.localStorage.getItem(key) !== null;
    } catch (error) {
        console.error('Error checking localStorage item:', error);
        return false;
    }
}

/**
 * 清空所有本地存储
 */
export function clearLocalStorage(): void {
    try {
        window.localStorage.clear();
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
}
