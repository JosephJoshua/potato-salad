import chalk from 'chalk';

const formatISODate = date => {
    return date.toISOString().replace(/T|Z/g, ' ').trim();
};

const formatLogInfo = text => {
    return `[${formatISODate(new Date())}] ${text}`;
};

const formatRuntime = runtime => {

    if (runtime < 1000)
        return chalk.greenBright(`${runtime}ms`);
    else if (runtime < 3000)
        return chalk.yellowBright(`${runtime}ms`);

    return chalk.redBright(`${runtime}ms`);
};

export const log = message => {
    console.log(formatLogInfo('LOG'.padEnd(8)), message);
};

export const logError = message => {
    console.log(formatLogInfo(chalk.redBright('ERROR'.padEnd(8))), message);
};

export const logReady = message => {
    console.log(formatLogInfo(chalk.greenBright('READY'.padEnd(8))), message);
};

export const logWarn = message => {
    console.log(formatLogInfo(chalk.yellowBright('WARN'.padEnd(8))), message);
};

export const logLoad = (message, runtime) => {
    console.log(formatLogInfo(chalk.blueBright('LOAD'.padEnd(8))), message, formatRuntime(runtime));
};

export const logCache = (message, runtime) => {
    console.log(formatLogInfo(chalk.magentaBright('CACHE'.padEnd(8))), message, formatRuntime(runtime));
};

export const logCommand = (message, runtime) => {
    console.log(formatLogInfo(chalk.cyanBright('COMMAND'.padEnd(8))), message, formatRuntime(runtime));
};
