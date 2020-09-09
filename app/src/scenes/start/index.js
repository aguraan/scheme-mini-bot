const Scene = require('telegraf/scenes/base')
const { sendNotification, recordUrlClick } = require('../../helpers')
const { match } = require('telegraf-i18n')
const {
    getMainKeyboard,
    getInfoInlineKeyboard,
    getTimeoutKeyboard
} = require('../keyboards')
const Form = require('./Form')


const scene = new Scene('start')

scene.enter(async ctx => {

    await ctx.replyWithHTML(ctx.i18n.t('scenes.start.make_your_choice'), getMainKeyboard(ctx))

    let user = await ctx.db.users.findById(ctx.from.id)
    if (!user) {
        user = await ctx.db.users.create({
            ...ctx.from,
            created: Date.now()
        })
        await sendNotification('newuser', ctx)
    }
    ctx.session.userId = user.id

    if (ctx.i18n.locale() !== ctx.from.language_code) {
        ctx.i18n.locale(ctx.from.language_code)
    }

    if (ctx.session.form) {
        ctx.session.form.clearTimeout()
        ctx.session.form.removeAllListeners('timeout')
        if (ctx.session.form.sended === false && !user.can) await sendNotification('form_canceled', ctx)
    }
})

scene.hears(match('buttons.new_order'), async ctx => {
    ctx.session.form = new Form()
    ctx.session.form.once('timeout', async () => {
        ctx.replyWithHTML(ctx.i18n.t('other.timeout_msg'), getTimeoutKeyboard(ctx))
        const user = await ctx.db.users.findById(ctx.from.id)
        if (user && !user.can) { // can't send orders
            sendNotification('form_timeout', ctx)
        }
    })
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