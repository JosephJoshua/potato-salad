const { readdir } = require('node:fs/promises');
const { join, resolve } = require('node:path');
const { performance } = require('node:perf_hooks');
const { cwd } = require('process');

const logger = require('./logger');

async function* findFiles(path, dir) {
    const dirPath = resolve(path, dir);
    const dirents = await readdir(dirPath, { withFileTypes: true });

    for (const dirent of dirents) {
        if (dirent.isDirectory()) yield* findFiles(path, join(dir, dirent.name));
        if (dirent.isFile() && dirent.name.endsWith('.js')) yield [path, dir, dirent.name];
    }
}

module.exports = async (dirName, func) => {

    for await (const [path, dir, file] of findFiles(join(cwd(), dirName), '')) {
        const startTime = performance.now();
        const logMessage = func(require(resolve(path, dir, file)), path, dir, file);
        const endTime = performance.now();
        logger.logLoad(logMessage, Math.ceil(endTime - startTime));
    }
};
