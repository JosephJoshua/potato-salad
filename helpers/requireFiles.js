const { readdir } = require('node:fs/promises');
const { resolve } = require('node:path');
const { performance } = require('node:perf_hooks');

const logger = require('./logger');

async function* findFiles(dirPath) {
    const dirents = await readdir(dirPath, { withFileTypes: true });

    for (const dirent of dirents) {
        const direntPath = resolve(dirPath, dirent.name);
        if (dirent.isDirectory()) yield* findFiles(direntPath);
        if (dirent.isFile() && dirent.name.endsWith('.js')) yield direntPath;
    }
}

module.exports = async (dirName, func) => {

    for await (const file of findFiles(dirName)) {
        const startTime = performance.now();
        const logMessage = func(require(file));
        const endTime = performance.now();
        logger.logLoad(logMessage, Math.ceil(endTime - startTime));
    }
};
