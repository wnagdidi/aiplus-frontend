const fs = require('fs');
const path = require('path');

const folderPath = './src/messages';

const files = fs.readdirSync(folderPath)

files.forEach(file => {
  const filePath = path.join(folderPath, file);

  const data = fs.readFileSync(filePath, 'utf8');

  const updatedData = data.replace(/{{(\w+)}}/g, '{$1}');

  fs.writeFileSync(filePath, updatedData, 'utf8');
});
