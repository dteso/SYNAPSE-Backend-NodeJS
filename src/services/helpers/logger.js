const fs = require('fs');
const chalk = require('chalk');

let logContent = [];

logger = (event) => {
    fs.readFile(`${process.env.SHARED_FOLDER}/protected/log.txt`, 'utf-8', (err, data) => {
        if (err) {
            console.log("Error reading log.txt");
            throw err
        }
        logContent = data;
        date = new Date();
        logContent += `${date.toUTCString()} - ${event}\n`;
        fs.writeFile(`${process.env.SHARED_FOLDER}/protected/log.txt`, logContent, (err) => {
            if (err) throw new Error('No se pudo grabar', err);
        });
    });
}

log = (p1, p2 = '>>>') => {
    const date = new Date();
    console.log(getCurrentDate(date));
    if (p2 === '>>>')
        console.log(p2, p1);
    else console.log(p1, p2);
}

logInfo = (p1, p2 = '>>>') => {
    const date = new Date();
    const strDate = getCurrentDate(date);
    if (p2 === '>>>')
        console.log(chalk.cyan(strDate + ' ' + p2, p1));
    else console.log(chalk.cyan(strDate + ' ' + p1, p2));
}

logSuccess = (p1, p2 = '>>>') => {
    const date = new Date();
    console.log(getCurrentDate(date));
    if (p2 === '>>>')
        console.log(chalk.greenBright(p2, p1));
    else console.log(chalk.greenBright(p1, p2));
}

logSuccessBg = (p1, p2 = '>>>') => {
    console.log('\n');
    const date = new Date();
    console.log(chalk.hex('#FF007F').bold('+-----------------------------------------------------+'));
    console.log(getCurrentDate(date));
    console.log(chalk.hex('#FF007F').bold('+-----------------------------------------------------+'));
    if (p2 === '>>>')
        console.log(chalk.hex('#FF007F').bold(p2, p1));
    else console.log(chalk.hex('#FF007F').bold(p1, p2));
}

logSendBg = (p1, p2 = '>>>') => {
    const date = new Date();
    console.log(chalk.hex('#33FF99').bold('+-----------------------------------------------------+'));
    console.log(getCurrentDate(date));
    console.log(chalk.hex('#33FF99').bold('+-----------------------------------------------------+'));
    if (p2 === '>>>')
        console.log(chalk.hex('#33FF99').bold(p2, p1));
    else console.log(chalk.hex('#33FF99').bold(p1, p2));
    console.log('\n');
}

logNotification = (p1, p2 = '>>>') => {
    const date = new Date();
    const displayDate = getCurrentDate(date);
    if (p2 === '>>>')
        console.log(chalk.hex('#7F00FF').bold(displayDate + ' ' + p2, p1));
    else console.log(chalk.hex('#7F00FF').bold(displayDate + ' ' + p1, p2));
}


logWarning = (p1, p2 = '>>>') => {
    const date = new Date();
    console.log(getCurrentDate(date));
    if (p2 === '>>>')
        console.log(chalk.yellowBright(p2, p1));
    else console.log(chalk.yellowBright(p1, p2));
}

logDanger = (p1, p2 = '>>>') => {
    const date = new Date();
    console.log(getCurrentDate(date));
    if (p2 === '>>>')
        console.log(chalk.redBright(p2, p1));
    else console.log(chalk.redBright(p1, p2));
}

getCurrentDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours() > 9 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}:${date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds()}`;
}


module.exports = {
    logger,
    log,
    logInfo,
    logWarning,
    logSuccess,
    logDanger,
    logSuccessBg,
    logSendBg,
    logNotification
};