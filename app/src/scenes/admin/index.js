const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const {
    getAuthURLInlineKeyboard,
    getAdminKeyboard,
    getEditLinksInlineKeyboard
} = require('../keyboards')
const {
    authorize,
    getAuthURL
} = require('../../google')
const { logWarn } = require('../../util/log')
const json2html = require('../../util/json2html')
const { exportURLStatsInHTML } = require('../../helpers')
const { Loading, sendingAnimation, clockAnimation } = require('../../helpers/loading')
const bot = require('../../bot')
const store = require('../../session')

const scene = new Scene('admin')

scene.enter(async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('other.admin'), getAdminKeyboard(ctx))
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.auth'), async ctx => {
    const url = getAuthURL(ctx.oAuth2Client)

    if (url) {
        await ctx.replyWithHTML(ctx.i18n.t('other.url_text'), getAuthURLInlineKeyboard(ctx, url))
    } else {
        await ctx.replyWithHTML(ctx.i18n.t('other.url_text_error'))
    }
})

scene.hears(match('buttons.reload_bot'), async ctx => {
    if (process.env.NODE_ENV === 'development') {
        return await ctx.reply('Бот в режиме "Long Polling". Перезагрузка невозможна.')
    }
    const { pending_update_count } = await bot.telegram.getWebhookInfo()
    await ctx.replyWithHTML(`<b>Перезагружаюсь...</b>\n\npending_update_count: ${ pending_update_count }`)
    const loading = new Loading(clockAnimation)
    await loading.start(ctx)
    try {
        const deleted = await bot.telegram.deleteWebhook(true)
        const WEB_HOOKS_SECRET_URL = process.env.NODE_ENV === 'production' ? process.env.WEB_HOOKS_SECRET_URL : process.env.TEST_WEB_HOOKS_SECRET_URL
        const WEB_HOOKS_PATH = process.env.NODE_ENV === 'production' ? process.env.WEB_HOOKS_PATH : process.env.TEST_WEB_HOOKS_PATH
        const PORT = process.env.NODE_ENV === 'production' ? process.env.PORT : process.env.TEST_PORT

        if (deleted) {
            await bot.stop()

            bot.telegram.setWebhook(WEB_HOOKS_SECRET_URL)
            await bot.startWebhook(WEB_HOOKS_PATH, null, PORT)
            const { pending_update_count } = await bot.telegram.getWebhookInfo()
            await loading.end(ctx)
            await ctx.replyWithHTML(`<b>✅ Бот был успешно перезагружен.</b>\n\npending_update_count: ${ pending_update_count }`)

            console.info('Bot restarted. mode: Webhook Development')
        }
    } catch (error) {
        console.error(error)
    }
})

scene.hears(match('buttons.wh_info'), async ctx => {
    if (process.env.NODE_ENV === 'development') {
        return await ctx.reply('Бот в режиме "Long Polling". Операция невозможна.')
    }
    const { pending_update_count } = await bot.telegram.getWebhookInfo()
    await ctx.replyWithHTML(`<b>pending_update_count:</b> ${ pending_update_count }`)
})

scene.hears(match('buttons.sessions'), async ctx => {
    const users = await ctx.db.users.find()

    const out = [...store].map(([key, value]) => {
        const user = users.find(user => user.id === value.session.userId)
        if (!user) return ''
        return `
            <b>${ user.first_name } ${ user.last_name }</b> | ${ user.username || 'не установлен' }
            Сцена: ${ value.session.__scenes.current }
            Удалить -> /delete_${ user.id }
        `
    })
    
    await ctx.replyWithHTML(`<b>Сессии:</b>\n${ out.join('\n---------------------\n') }`)
})

scene.hears(/\/delete_(.*)/, async ctx => {
    const sessionKey = `${ ctx.match[1] }:${ ctx.match[1] }`
    const deleted = store.delete(sessionKey)
    if (deleted) {
        await ctx.reply(`✅ Сессия успешно удалена: ${ sessionKey }`)
    } else {
        await ctx.reply(`❌ Сессия не была найдена. Операция отменена.`)
    }
})

scene.hears(match('buttons.get_file'), async ctx => {
    await ctx.scene.enter('get_file')
})

scene.hears(match('buttons.export'), async ctx => {
    try {
        await ctx.replyWithHTML(ctx.i18n.t('other.exporting'))
        const coll = await ctx.db.users.find()
        const html = json2html(coll.map(item => {
            if (item.created) {
                const created = new Date(item.created).toLocaleDateString('uk')
                return { ...item, created }
            }
            return item
        }))
        const loading = new Loading(sendingAnimation)
        await loading.start(ctx)
        await ctx.sendMail({
            to: process.env.EMAIL_ADDRESS,
            subject: `Экспорт пользователей из базы данных`,
            html
        })
        await loading.end(ctx)
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
        const loading = new Loading(sendingAnimation)
        await loading.start(ctx)
        await ctx.sendMail({
            to: process.env.EMAIL_ADDRESS,
            subject: `Статистика по ссылкам`,
            html
        })
        await loading.end(ctx)
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