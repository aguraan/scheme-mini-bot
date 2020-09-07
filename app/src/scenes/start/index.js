const Scene = require('telegraf/scenes/base')
const { sendNotification, recordUrlClick } = require('../../helpers')
const { match } = require('telegraf-i18n')
const {
    getMainKeyboard,
    getInfoInlineKeyboard
} = require('../keyboards')


const scene = new Scene('start')

scene.enter(async ctx => {

    const user = await ctx.db.users.findById(ctx.from.id)
    if (!user) {
        const newUser = await ctx.db.users.create({
            ...ctx.from,
            created: Date.now()
        })
        ctx.session.userId = newUser.id
        sendNotification('newuser', ctx)
    } else {
        ctx.session.userId = user.id
    }

    if (ctx.i18n.locale() !== ctx.from.language_code) {
        ctx.i18n.locale(ctx.from.language_code)
    }

    ctx.session.form = null
    await ctx.replyWithHTML(ctx.i18n.t('scenes.start.make_your_choice'), getMainKeyboard(ctx))
})

scene.hears(match('buttons.new_order'), async ctx => {
    ctx.session.form = {
        city: '',
        address: '',
        contact_name: '',
        phone_number: '',
        files: null,
        comments: '',
        formats: '',
        email: ''
    }
    await ctx.scene.enter('new_order')
})

scene.hears(match('buttons.info'), async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('scenes.start.about_us'), getInfoInlineKeyboard(ctx))
})

scene.on('callback_query', async ctx => {
    const data = JSON.parse(ctx.update.callback_query.data)
    if (data.type === 'info') {
        const locale = ctx.i18n.locale()
        switch (data.val) {
            case 'process': {
                const url = await ctx.db.urls.findById('process')
                await recordUrlClick(ctx, url)
                const href = locale in url.href ? url.href[locale] : ctx.i18n.t('other.edit_links_not_found')
                await ctx.replyWithHTML(href)
                break
            }
            case 'prices': {
                const url = await ctx.db.urls.findById('prices')
                await recordUrlClick(ctx, url)
                const href = locale in url.href ? url.href[locale] : ctx.i18n.t('other.edit_links_not_found')
                await ctx.replyWithHTML(href)
                break
            }
            case 'examples': {
                const url = await ctx.db.urls.findById('examples')
                await recordUrlClick(ctx, url)
                const href = locale in url.href ? url.href[locale] : ctx.i18n.t('other.edit_links_not_found')
                await ctx.replyWithHTML(href)
                break
            }
        }
    }
})

scene.command('admin', async ctx => {
    if (ctx.isAdmin()) {
        await ctx.scene.enter('admin')
    } else {
        await ctx.replyWithHTML(ctx.i18n.t('scenes.start.make_your_choice'), getMainKeyboard(ctx))
    }
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('scenes.start.make_your_choice'), getMainKeyboard(ctx))
})

module.exports = scene