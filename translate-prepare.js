const fs = require('fs');
const path = require('path');

const folderPath = './src/messages';

const files = fs.readdirSync(folderPath)

const changeData = fs.readFileSync(folderPath + '/change.json', 'utf8')
const changeJson = JSON.parse(changeData)

const adjustStructure = (base, target) => {
  const result = { ...target }; // 复制目标对象

  // 遍历 base 的键，更新 target
  for (const key in base) {
    if (typeof base[key] === 'object' && !Array.isArray(base[key])) {
      // 如果 base[key] 是对象，并且 target[key] 是字符串或不存在
      if (typeof target[key] !== 'object' || target[key] === undefined) {
        // 将 target[key] 设置为 base[key] 的结构
        result[key] = { ...base[key] };
      } else {
        // 递归调整内部结构
        result[key] = adjustStructure(base[key], target[key]);
      }
    } else if (target[key] === undefined) {
      // 如果 target 中没有这个 key，则使用 base 中的值
      result[key] = base[key];
    }
  }

  return result;
}

files.forEach(file => {
  const filePath = path.join(folderPath, file);

  const data = fs.readFileSync(filePath, 'utf8');

  const updatedData = data.replace(/{(\w+)}/g, '{{$1}}');

  const messagesJson = JSON.parse(updatedData)

  const result = adjustStructure(changeJson, messagesJson)

  fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf8');
});



