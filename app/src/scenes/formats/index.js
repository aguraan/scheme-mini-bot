const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getFormatsKeyboard } = require('../keyboards')
const { nextScene } = require('../../helpers')

const scene = new Scene('formats')
const defaultFormats = 'dwg/dxf'

scene.enter(async ctx => {
    const { formats } = ctx.session.form
    const keyboard = getFormatsKeyboard(ctx, !!formats)
    await ctx.replyWithHTML(ctx.i18n.t('scenes.new_order.formats'), keyboard)
})

scene.hears(match('buttons.back'), async ctx => await nextScene(ctx))
scene.hears(match('buttons.cancel'), async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.not_needed'), async ctx => {
    ctx.session.form.formats = defaultFormats
    await nextScene(ctx)
})

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    ctx.session.form.formats = `${ defaultFormats }, ${ answer }` 
    await nextScene(ctx)
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('validation.formats'))
})

module.exports = scene