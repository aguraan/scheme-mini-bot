const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getNavKeyboard } = require('../keyboards')
const { nextScene } = require('../../helpers')

const scene = new Scene('phone_number')

scene.enter(async ctx => {
    const { phone_number } = ctx.session.form
    const keyboard = getNavKeyboard(ctx, phone_number ? ['back'] : ['cancel_order'])
    await ctx.replyWithHTML(ctx.i18n.t('scenes.new_order.phone_number'), keyboard)
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.back'), async ctx => await nextScene(ctx))
scene.hears(match('buttons.cancel_order'), async ctx => await ctx.scene.enter('start'))

scene.on('contact', async ctx => {
    const { phone_number } = ctx.message.contact
    ctx.session.form.phone_number = phone_number
    await nextScene(ctx)
})

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    const normalized = answer.replace(/[()\s-]/g, '')
    const validPhoneNumber = /^\+?3?8?(0\d{9})$/.test(normalized)
    if (validPhoneNumber) {
        ctx.session.form.phone_number = answer
        await nextScene(ctx)
    } else {
        await ctx.replyWithHTML(ctx.i18n.t('validation.phone_number'))
    }
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('validation.phone_number'))
})

module.exports = scene