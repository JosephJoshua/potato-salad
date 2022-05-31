const { redBright, greenBright, yellowBright, blueBright, magentaBright, cyanBright } = require('chalk');

const formatRuntime = runtime => {
    if (runtime < 1000) {
        return greenBright(`${runtime}ms`);
    } else if (runtime < 3000) {
        return yellowBright(`${runtime}ms`);
    }
    return redBright(`${runtime}ms`);
};

const formatISODate = date => {
    return date.toISOString().replace(/T|Z/g, ' ').trim();
};

const formatLogInfo = text => {
    return `[${formatISODate(new Date())}] ${text}`;
};

module.exports = {
    log: message => {
        console.log(formatLogInfo('LOG'.padEnd(20)), message);
    },
    logError: message => {
        console.log(formatLogInfo(redBright('ERROR').padEnd(20)), message);
    },
    logReady: message => {
        console.log(formatLogInfo(greenBright('READY').padEnd(20)), message);
    },
    logWarn: message => {
        console.log(formatLogInfo(yellowBright('WARN').padEnd(20)), message);
    },
    logLoad: (message, runtime) => {
        console.log(formatLogInfo(blueBright('LOAD').padEnd(20)), message, formatRuntime(runtime));
    },
    logCommand: (message, runtime) => {
        console.log(formatLogInfo(magentaBright('COMMAND').padEnd(20)), message, formatRuntime(runtime));
    },
    logInit: message => {
        console.log(formatLogInfo(cyanBright('INIT').padEnd(20)), message);
    },
};
