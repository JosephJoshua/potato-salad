const formatDate = date => {
    const monthStrings = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const day = date.getDate();
    const month = monthStrings[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

const formatDuration = (duration, precision = 2) => {

    const oneSecond = 1000;
    const oneMinute = oneSecond * 60;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;

    if (duration < oneSecond) return `${duration} ms`;

    const days = Math.floor(duration / oneDay);
    const hours = Math.floor(duration % oneDay / oneHour);
    const minutes = Math.floor(duration % oneHour / oneMinute);
    const seconds = Math.floor(duration % oneMinute / oneSecond);

    const output = [];

    if (days || output.length) output.push(days ? pluralize(days, 'day') : '');
    if (hours || output.length) output.push(hours ? pluralize(hours, 'hr') : '');
    if (minutes || output.length) output.push(minutes ? pluralize(minutes, 'min') : '');
    if (seconds || output.length) output.push(seconds ? pluralize(seconds, 'sec') : '');

    return output.slice(0, precision).join(' ').trim();
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

const pluralize = (count, word, suffix = 's') => {
    if (count === 1) return `${count} ${word}`;
    return `${count} ${word}${suffix}`;
};

module.exports = {
    formatDate,
    formatDuration,
    formatMemory,
    pluralize,
};
