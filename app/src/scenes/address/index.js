const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getCancelKeyboard } = require('../keyboards')
const { nextScene } = require('../../helpers')
const { reverseGeocode } = require('../../google')

const scene = new Scene('address')

scene.enter(async ctx => {
    const { address } = ctx.session.form
    const keyboard = getCancelKeyboard(ctx, !!address)
    await ctx.replyWithHTML(ctx.i18n.t('scenes.new_order.address'), keyboard)
})

scene.hears(match('buttons.back'), async ctx => await nextScene(ctx))
scene.hears(match('buttons.cancel'), async ctx => await ctx.scene.enter('start'))

scene.on('location', async ctx => {
    const location = await reverseGeocode(ctx.message.location)
    ctx.session.form.address = location.formatted_address
    await nextScene(ctx)
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    ctx.session.form.address = answer
    await nextScene(ctx)
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('validation.address'))
})

module.exports = scene