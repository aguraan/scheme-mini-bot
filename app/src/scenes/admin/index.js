const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const {
    getAuthURLInlineKeyboard,
    getMainKeyboard,
    getAdminKeyboard,
    getEditLinksInlineKeyboard
} = require('../keyboards')
const {
    authorize,
    getAuthURL
} = require('../../google')
const { logWarn } = require('../../util/log')
const { exportURLStatsInHTML } = require('../../helpers')

const scene = new Scene('admin')

scene.enter(async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('other.admin'), getAdminKeyboard(ctx))
})

scene.hears(match('buttons.auth'), async ctx => {
    const url = getAuthURL(ctx.oAuth2Client)

    if (url) {
        await ctx.replyWithHTML(ctx.i18n.t('other.url_text'), getAuthURLInlineKeyboard(ctx, url))
    } else {
        await ctx.replyWithHTML(ctx.i18n.t('other.url_text_error'))
    }
})

scene.hears(match('buttons.export'), async ctx => {
    try {
        await ctx.replyWithHTML(ctx.i18n.t('other.exporting'))
        const html = await ctx.db.users.exportHTML()
        await ctx.replyWithHTML(ctx.i18n.t('other.sending'))
        await ctx.sendMail({
            to: process.env.EMAIL_ADDRESS,
            subject: `Экспорт пользователей из базы данных`,
            html
        })
        await ctx.replyWithHTML(ctx.i18n.t('other.sending_success'))
    } catch (error) {
        await ctx.replyWithHTML(ctx.i18n.t('other.error'))
        logWarn(error, ctx)
    }
})

scene.hears(match('buttons.edit_links'), async ctx => {
    const urls = await ctx.db.urls.find()
    await ctx.replyWithHTML(ctx.i18n.t('other.edit_links_text'), getEditLinksInlineKeyboard(ctx, urls))
})

scene.hears(match('buttons.url_stats'), async ctx => {
    try {
        await ctx.replyWithHTML(ctx.i18n.t('other.exporting'))
        const html = await exportURLStatsInHTML(ctx)
        await ctx.replyWithHTML(ctx.i18n.t('other.sending'))
        await ctx.sendMail({
            to: process.env.EMAIL_ADDRESS,
            subject: `Статистика по ссылкам`,
            html
        })
        await ctx.replyWithHTML(ctx.i18n.t('other.sending_success'))
    } catch (error) {
        await ctx.replyWithHTML(ctx.i18n.t('other.error'))
        logWarn(error, ctx)
    }
})

scene.hears(match('buttons.exit'), async ctx => await ctx.scene.enter('start'))

scene.on('callback_query', async ctx => {
    const data = JSON.parse(ctx.update.callback_query.data)
    if (data.type === 'e_link') {
        ctx.session.current_link_id = data.id 
        await ctx.scene.enter('edit_link')
    }
})

scene.command(['admin', 'start'], async ctx => {
    await ctx.scene.reenter()
})

scene.on('text', async ctx => {
    const code = ctx.message.text.trim()
    try {
        await authorize(ctx.oAuth2Client, code)
        await ctx.replyWithHTML(ctx.i18n.t('other.success'))
    } catch (error) {
        await ctx.replyWithHTML(ctx.i18n.t('other.auth_error'))
        logWarn(error, ctx)
    }
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('other.admin'), getAdminKeyboard(ctx))
})

module.exports = scene