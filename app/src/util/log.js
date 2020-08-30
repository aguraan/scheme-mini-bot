const { inspect, format } = require('util')
const fs = require('fs')
const path = require('path')

const logFilePath = path.resolve(__dirname, '..', '..', 'debug.log')
const logFile = fs.createWriteStream(logFilePath, { flags: 'w' })
const logSTDOut = process.stdout

const logError = async (err, ctx) => {
    const errText = format(err) + '\n'
    ctx.replyWithHTML(ctx.i18n.t('other.error'))
    logFile.write(errText)
    logSTDOut.write(errText)
    await ctx.sendMail({
        to: process.env.EMAIL_ADDRESS,
        subject: `🚨 ERROR! | Отчет об ошибке.`,
        text: errText
    })
    process.exit(1)
}

const logWarn = (err, ctx) => {
    const warningText = 'WARNING! ' + format(err) + '\n'
    logFile.write(warningText)
    logSTDOut.write(warningText)
    ctx.sendMail({
        to: process.env.EMAIL_ADDRESS,
        subject: `⚠ WARNING! | Отчет об ошибке.`,
        text: warningText
    })
}
const print = value =>
	console.log(inspect(value, { colors: true, depth: null }))


module.exports = {
    logError,
    logWarn,
    print
}