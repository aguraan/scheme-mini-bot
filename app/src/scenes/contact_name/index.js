const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const {
    getCancelKeyboard
} = require('../keyboards')
const { nextScene } = require('../../helpers')

const scene = new Scene('contact_name')

scene.enter(async ctx => {
    const { contact_name } = ctx.session.form
    const keyboard = getCancelKeyboard(ctx, !!contact_name)
    await ctx.replyWithHTML(ctx.i18n.t('scenes.new_order.contact_name'), keyboard)
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.back'), async ctx => await nextScene(ctx))
scene.hears(match('buttons.cancel'), async ctx => await ctx.scene.enter('start'))

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    ctx.session.form.contact_name = answer
    await nextScene(ctx)
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('validation.contact_name'))
})

module.exports = scene