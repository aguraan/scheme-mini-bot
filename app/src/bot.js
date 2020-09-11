const { Telegraf } = require('telegraf')
const token = process.env.BOT_TOKEN
const bot = new Telegraf(token)

Object.assign(bot.context, require('./context'))

module.exports = bot