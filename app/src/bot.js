const { Telegraf } = require('telegraf')
const token = process.env.NODE_ENV === 'production' ? process.env.BOT_TOKEN : process.env.TEST_BOT_TOKEN
const bot = new Telegraf(token, {
    webhookReply: ['production', 'dev_webhook'].some(mode => process.env.NODE_ENV === mode)
})

Object.assign(bot.context, require('./context'))

module.exports = bot