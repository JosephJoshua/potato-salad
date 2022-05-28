const monthStrings = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const formatDate = date => {
    const day = date.getDate();
    const month = monthStrings[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

module.exports = {
    formatDate,
};