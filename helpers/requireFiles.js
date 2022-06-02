const { readdir } = require('node:fs/promises');
const { parse, relative, resolve } = require('node:path');

const logger = require('./logger');
const time = require('./time');

const MAX_DEPTH = 1;

async function* findFiles(dirPath, depth = 0) {
    if (depth > MAX_DEPTH) return;

    const dirents = await readdir(dirPath, { withFileTypes: true });

    for (const dirent of dirents) {
        const direntPath = resolve(dirPath, dirent.name);
        if (dirent.isDirectory()) yield* findFiles(direntPath, depth + 1);
        if (dirent.isFile() && dirent.name.endsWith('.js')) yield direntPath;
    }
}

module.exports = async (dirName, func) => {
    for await (const filePath of findFiles(dirName)) {
        let pathElements = {};
        const runtime = await time(() => {
            pathElements = parse(relative(dirName, filePath));
            func(require(filePath), pathElements);
        });
        logger.logLoad(`${dirName}: ${pathElements.name}`, runtime);
    }
};
