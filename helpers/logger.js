const { redBright, greenBright, yellowBright, blueBright, magentaBright, cyanBright } = require('chalk');

const formatISODate = () => {
    return new Date().toISOString().replace(/T|Z/g, ' ').trim();
};

module.exports = {
    log: message => {
        console.log(`[${formatISODate()}] LOG    `, message);
    },
    logError: message => {
        console.log(`[${formatISODate()}] ${redBright('ERROR')}	 `, message);
    },
    logReady: message => {
        console.log(`[${formatISODate()}] ${greenBright('READY')}	 `, message);
    },
    logWarn: message => {
        console.log(`[${formatISODate()}] ${yellowBright('WARN')}	 `, message);
    },
    logLoad: message => {
        console.log(`[${formatISODate()}] ${blueBright('LOAD')}	 `, message);
    },
    logCache: message => {
        console.log(`[${formatISODate()}] ${magentaBright('CACHE')}	 `, message);
    },
    logInit: message => {
        console.log(`[${formatISODate()}] ${cyanBright('INIT')}	 `, message);
    },
};
