const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

module.exports = (dirName, func) => {

    const dir = path.join(process.cwd(), dirName);

    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.js'))
        .map(file => {
            const filePath = path.join(dir, file);
            return func(require(filePath));
        });
};
