const Scene = require('telegraf/scenes/base')
const { getNewOrderKeyboard } = require('../keyboards')
const { nextScene } = require('../../helpers')
const { match } = require('telegraf-i18n')

const scene = new Scene('new_order')

scene.enter(async ctx => {
    await ctx.replyWithHTML(
        ctx.i18n.t('scenes.new_order.order_requirements'),
        getNewOrderKeyboard(ctx)
    )
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.continue'), async ctx => {
    await nextScene(ctx)
})

scene.hears(match('buttons.back'), async ctx => {
    await ctx.scene.enter('start')
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('validation.new_order'))
})

module.exports = scene