const { Telegraf } = require('telegraf')
const token = process.env.NODE_ENV === 'production' ? process.env.BOT_TOKEN : process.env.TEST_BOT_TOKEN
const bot = new Telegraf(token)

Object.assign(bot.context, require('./context'))

module.exports = bot