const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getCancelKeyboard } = require('../keyboards')

const scene = new Scene('edit_link')

scene.enter(async ctx => {
    const url = await ctx.db.urls.findById(ctx.session.current_link_id)
    if (url) {
        const text = ctx.i18n.t('other.edit_links_current', {
            current_link: url.href
        })
        await ctx.replyWithHTML(text, getCancelKeyboard(ctx, 'back'))
    } else {
        ctx.replyWithHTML('other.edit_links_not_found')
    }
})

scene.hears(match('buttons.back'), async ctx => await ctx.scene.enter('admin'))

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    try {
        new URL(answer)
        await ctx.db.urls.update(
            ctx.session.current_link_id,
            { href: answer }
        )
        await ctx.replyWithHTML(ctx.i18n.t('other.edit_links_changed'))
        await ctx.scene.enter('admin')
    } catch (error) {
        await ctx.replyWithHTML(ctx.i18n.t('other.edit_links_bad_url'))
    }
})

module.exports = scene