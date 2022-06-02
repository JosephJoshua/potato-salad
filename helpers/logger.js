const { redBright, greenBright, yellowBright, blueBright, magentaBright, cyanBright } = require('chalk');

const formatISODate = date => {
    return date.toISOString().replace(/T|Z/g, ' ').trim();
};

const formatLogInfo = text => {
    return `[${formatISODate(new Date())}] ${text}`;
};

const formatRuntime = runtime => {
    if (runtime < 1000) {
        return greenBright(`${runtime}ms`);
    } else if (runtime < 3000) {
        return yellowBright(`${runtime}ms`);
    }
    return redBright(`${runtime}ms`);
};

module.exports = {
    log: message => {
        console.log(formatLogInfo('LOG'.padEnd(8)), message);
    },
    logError: message => {
        console.log(formatLogInfo(redBright('ERROR'.padEnd(8))), message);
    },
    logReady: message => {
        console.log(formatLogInfo(greenBright('READY'.padEnd(8))), message);
    },
    logWarn: message => {
        console.log(formatLogInfo(yellowBright('WARN'.padEnd(8))), message);
    },
    logLoad: (message, runtime) => {
        console.log(formatLogInfo(blueBright('LOAD'.padEnd(8))), message, formatRuntime(runtime));
    },
    logCache: (message, runtime) => {
        console.log(formatLogInfo(magentaBright('CACHE'.padEnd(8))), message, formatRuntime(runtime));
    },
    logCommand: (message, runtime) => {
        console.log(formatLogInfo(cyanBright('COMMAND'.padEnd(8))), message, formatRuntime(runtime));
    },
};
