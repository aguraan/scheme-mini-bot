const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getCityKeyboard } = require('../keyboards')
const { nextScene } = require('../../helpers')

const scene = new Scene('city')

scene.enter(async ctx => {
    const { city } = ctx.session.form
    const keyboard = getCityKeyboard(ctx, !!city)
    await ctx.replyWithHTML(ctx.i18n.t('scenes.new_order.city'), keyboard)
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.back'), async ctx => await nextScene(ctx))
scene.hears(match('buttons.cancel'), async ctx => await ctx.scene.enter('start'))

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    if (/[0-9]/.test(answer)) {
        await ctx.replyWithHTML(ctx.i18n.t('validation.city'))
    } else {
        ctx.session.form.city = answer
        await nextScene(ctx)
    }
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('validation.city'))
})

module.exports = scene