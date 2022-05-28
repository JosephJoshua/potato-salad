const { cyanBright, yellowBright, red, magenta, greenBright } = require('chalk');

const logTypes = Object.freeze(
    {
        'log': 1, 'warn': 2, 'error': 3, 'debug': 4, 'command': 5, 'ready': 6,
    },
);

function formatDate(date) {
    return date.toISOString().replace(/T|Z/g, ' ').trim();
}

class Logger {
    static log(content, type = logTypes.log) {
        const now = new Date(Date.now());
        const dateStr = `[${formatDate(now)}]`;

        switch (type) {
        case logTypes.log: {
            console.log(`${dateStr} LOG:`, content);
            return;
        }

        case logTypes.warn: {
            console.log(`${dateStr} ${yellowBright('WARN')}:`, content);
            return;
        }

        case logTypes.error: {
            console.log(`${dateStr} ${red('ERROR')}:`, content);
            return;
        }

        case logTypes.debug: {
            console.log(`${dateStr} ${magenta('DEBUG')}:`, content);
            return;
        }

        case logTypes.command: {
            console.log(`${dateStr} ${cyanBright('COMMAND')}:`, content);
            return;
        }

        case logTypes.ready: {
            console.log(`${dateStr} ${greenBright('READY')}:`, content);
            return;
        }

        default: throw new TypeError('Logger type must be a type of logTypes.');
        }
    }
}

Logger.logTypes = logTypes;
module.exports = Logger;