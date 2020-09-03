const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getCancelKeyboard } = require('../keyboards')
const { nextScene } = require('../../helpers')

const scene = new Scene('email')

scene.enter(async ctx => {
    const { email } = ctx.session.form
    const keyboard = getCancelKeyboard(ctx, !!email)
    await ctx.replyWithHTML(ctx.i18n.t('scenes.new_order.email'), keyboard)
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.back'), async ctx => await nextScene(ctx))
scene.hears(match('buttons.cancel'), async ctx => await ctx.scene.enter('start'))

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    const validEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(answer)
    if (validEmail) {
        ctx.session.form.email = answer
        await nextScene(ctx)
    } else {
        await ctx.replyWithHTML(ctx.i18n.t('validation.email'))
    }
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('validation.email'))
})

module.exports = scene