import { readdir } from 'node:fs/promises';
import { parse, relative, resolve } from 'node:path';

import { logLoad } from './logger.js';
import time from './time.js';

const MAX_DEPTH = 1;

async function* findModules(dirPath, depth = 0) {

    if (depth > MAX_DEPTH) return;

    const dirents = await readdir(dirPath, { withFileTypes: true });

    for (const dirent of dirents) {
        const direntPath = resolve(dirPath, dirent.name);
        if (dirent.isDirectory()) yield* findModules(direntPath, depth + 1);
        if (dirent.isFile() && dirent.name.endsWith('.js')) yield direntPath;
    }
}

export default async (dirName, func) => {

    for await (const filePath of findModules(dirName)) {

        let pathElements = {};

        const runtime = await time(async () => {

            pathElements = parse(relative(dirName, filePath));

            const module = await import(`file://${filePath}`);
            func(module.default ?? module, pathElements);
        });

        logLoad(`${dirName}: ${pathElements.name}`, runtime);
    }
};
