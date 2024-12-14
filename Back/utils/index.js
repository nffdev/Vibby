const fs = require('node:fs');

const badwords = fs.readFileSync('utils/badwords.txt', 'utf-8').replace(/\r/g, '').split('\n');

function sleep(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}

function hasBadWords(text) {
    return badwords.some(badword => text.toLowerCase().includes(badword.toLowerCase()));
}

module.exports = {
    sleep,
    hasBadWords
};