const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

Object.assign(bot.context, require('./context'))

module.exports = bot