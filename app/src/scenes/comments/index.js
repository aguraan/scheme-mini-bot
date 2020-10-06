const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getNavKeyboard } = require('../keyboards')
const { nextScene } = require('../../helpers')

const scene = new Scene('comments')

scene.enter(async ctx => {
    const { comments, files } = ctx.session.form
    const buttons = []

    if (comments) buttons.push('back')
    else buttons.push('cancel_order')

    // if (files && files.length) buttons.push('continue')
    buttons.push('continue')

    const keyboard = getNavKeyboard(ctx, buttons) 
    await ctx.replyWithHTML(ctx.i18n.t('scenes.new_order.comments'), keyboard)
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.back'), async ctx => await nextScene(ctx))
scene.hears(match('buttons.continue'), async ctx => {
    const { form } = ctx.session
    const { files, comments } = form

    if (comments) {
        await nextScene(ctx)
    } else if (files && files.length) {
        form.comments = '🍪'
        await nextScene(ctx)
    } else {
        await ctx.scene.reenter()
    }

    
})
scene.hears(match('buttons.cancel_order'), async ctx => await ctx.scene.enter('start'))

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    ctx.session.form.comments += `${ answer }\n`
    // await nextScene(ctx)
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('validation.comments'))
})

module.exports = scene