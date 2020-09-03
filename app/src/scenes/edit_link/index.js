const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getCancelKeyboard } = require('../keyboards')

const scene = new Scene('edit_link')

scene.enter(async ctx => {
    const url = await ctx.db.urls.findById(ctx.session.current_link_id)
    if (url) {
        const locale = ctx.i18n.locale()
        const href = locale in url.href ? url.href[locale] : ctx.i18n.t('other.edit_links_not_found')
        const text = ctx.i18n.t('other.edit_links_current', {
            current_link: href
        })
        await ctx.replyWithHTML(text, getCancelKeyboard(ctx, 'back'))
    } else {
        await ctx.replyWithHTML('other.edit_links_not_found')
    }
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.back'), async ctx => await ctx.scene.enter('admin'))

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    try {
        new URL(answer)
    } catch (error) {
        await ctx.replyWithHTML(ctx.i18n.t('other.edit_links_bad_url'))
        return
    }
    const url = await ctx.db.urls.findById(ctx.session.current_link_id)
    if (url) {
        const locale = ctx.i18n.locale()
        if (locale in url.href) url.href[locale] = answer
        await ctx.db.urls.update(ctx.session.current_link_id, { href: url.href })
        await ctx.replyWithHTML(ctx.i18n.t('other.edit_links_changed'))
        await ctx.scene.enter('admin')
    } else {
        await ctx.replyWithHTML('other.edit_links_not_found')
    }
})

module.exports = scene