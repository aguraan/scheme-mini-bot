const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getCancelKeyboard } = require('../keyboards')
const { nextScene } = require('../../helpers')

const scene = new Scene('comments')

scene.enter(async ctx => {
    const { comments } = ctx.session.form
    const keyboard = getCancelKeyboard(ctx, !!comments) 
    await ctx.replyWithHTML(ctx.i18n.t('scenes.new_order.comments'), keyboard)
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.back'), async ctx => await nextScene(ctx))
scene.hears(match('buttons.cancel'), async ctx => await ctx.scene.enter('start'))

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    ctx.session.form.comments = answer
    await nextScene(ctx)
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('validation.comments'))
})

module.exports = scene