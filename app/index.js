require('dotenv').config()
const { logError } = require('./src/util/log')
const bot = require('./src/bot')
const fs = require('fs')

bot.use(require('./src/middlewares'))

bot.catch(logError)


if (process.env.NODE_ENV === 'production') {

    bot.telegram.setWebhook(process.env.WEB_HOOKS_SECRET_URL)
    bot.startWebhook(process.env.WEB_HOOKS_PATH, null, process.env.PORT)

    bot.telegram.getWebhookInfo()
        .then(info => {
            console.log({info})
        })

    console.info('Bot launched. mode: Webhook-Docker')
} else {
<<<<<<< HEAD
    const cert = fs.readFileSync('/etc/letsencrypt/live/scheme.com.ua/cert.pem')
    const key = fs.readFileSync('/etc/letsencrypt/live/scheme.com.ua/privkey.pem')
    const tlsOptions = { key, cert, ca: [ cert ] }
    console.log({tlsOptions})

    bot.telegram.setWebhook(process.env.WEB_HOOKS_SECRET_URL, {
        source: cert
    })
=======
    const tlsOptions = {
        key: fs.readFileSync('/etc/letsencrypt/live/scheme.com.ua/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/scheme.com.ua/cert.pem')
    }

    bot.telegram.setWebhook(process.env.WEB_HOOKS_SECRET_URL)
>>>>>>> 2d1cc768bab2dee3816057dd61257f18c6325629
    bot.startWebhook(process.env.WEB_HOOKS_PATH, tlsOptions, process.env.PORT)

    bot.telegram.getWebhookInfo()
        .then(info => {
            console.log({info})
        })

    console.info('Bot launched. mode: Webhook-Dev')
}