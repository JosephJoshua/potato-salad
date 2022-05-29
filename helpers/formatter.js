const formatDate = date => {
    const monthStrings = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const day = date.getDate();
    const month = monthStrings[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

const formatMemory = memory => {
    if (memory <= 0) return `${memory} B`;

    const units = [
        'B', 'kB', 'MB', 'GB', 'TB',
    ];

    // Take the log base 1024 of the memory to figure out the largest unit we can convert it to.
    const unitIndex = Math.floor(Math.log(memory) / Math.log(1024));

    // The amount of bytes 1 of the target unit represents.
    // e.g 1 kB = 1024 B
    const oneOfUnit = Math.pow(1024, unitIndex);

    // Convert the memory passed in to the target unit.
    const value = Number((memory / oneOfUnit).toFixed(2));

    return `${value} ${units[unitIndex]}`;
};

const formatDuration = duration => {
    const oneDay = 24 * 60 * 60 * 1000;
    const oneHour = oneDay / 24;
    const oneMinute = oneHour / 60;
    const oneSecond = oneMinute / 60;

    if (duration < oneSecond) return `${duration} ms`;

    const days = Math.floor(duration / oneDay);
    const hours = Math.floor((duration - days * oneDay) / oneHour);
    const minutes = Math.floor((duration - days * oneDay - hours * oneHour) / oneMinute);
    const seconds = Math.floor((duration - days * oneDay - hours * oneHour - minutes * oneMinute) / oneSecond);

    const output = [];

    if (days > 0) {
        output.push(pluralize(days, 'day'));
    }

    if (hours > 0) {
        output.push(pluralize(hours, 'hour'));
    }

    if (minutes > 0) {
        output.push(pluralize(minutes, 'minute'));
    }

    if (seconds > 0) {
        output.push(pluralize(seconds, 'second'));
    }

    return output.join(' ');
};

const pluralize = (count, word, suffix = 's') => {
    if (count === 1) return `${count} ${word}`;
    return `${count} ${word}${suffix}`;
};

module.exports = {
    formatDate,
    formatMemory,
    formatDuration,
    pluralize,
};
