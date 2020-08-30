const handlebars = require('handlebars')
const path = require('path')
const fs = require('fs/promises')
const { logWarn } = require('../util/log')
const json2html = require('../util/json2html')

const nextScene = async ctx => {
    const { form } = ctx.session
    if (form) {
        const next = Object.entries(form)
            .find(([key, value]) => {
                if (!value) return key
                return false    
            })

        if (next) await ctx.scene.enter(next[0])
        else await ctx.scene.enter('order_review')  
    } else {
        await ctx.scene.enter('start')
    }
}

const createMailHTML = async ctx => {
    const { form } = ctx.session
    const filename = ctx.i18n.locale() + '_mail.html'
    const file = await fs.readFile(path.resolve(__dirname, '..', 'templates', 'mail', filename), 'utf-8')
    const template = handlebars.compile(file)
    return template(form)
}

const createMailAttachments = async ctx => {
    const { files } = ctx.session.form
    return await Promise.all(
        files.map(async file => {
            if (file.type === 'photo') {
                const photo = {}
                photo.path = await ctx.tg.getFileLink(file.id)
                photo.filename = photo.path.split('/').pop()
                photo.cid = file.cid
                if (file.caption) photo.caption = file.caption
                return photo
            }
            if (file.type === 'document') {
                const doc = {}
                doc.path = await ctx.tg.getFileLink(file.id)
                doc.filename = file.filename
                if (file.caption) photo.caption = file.caption
                return doc
            }
        })
    )
}

const sendNotification = async (type, ctx) => {
    if (type === 'newuser') {
        const user = await ctx.db.users.findById(ctx.session.userId)
        if (user) {
            const { first_name, last_name, id, username } = user
            const file = await fs.readFile(path.resolve(__dirname, '..', 'templates', 'new_user.html'), 'utf-8')
            const template = handlebars.compile(file)
            try {
                await ctx.sendMail({
                    to: process.env.EMAIL_ADDRESS,
                    subject: `У нас новый пользователь! ${ first_name } ${ last_name }`,
                    html: template({
                        id,
                        name: `${ first_name } ${ last_name }`,
                        username: username || 'не установлен'
                    })
                })
            } catch (error) {
                logWarn(error, ctx)
            }
        }
    }
}

const recordUrlClick = async (ctx, { id, clicks }) => {
    const userClicks = clicks.find(click => click.user_id === ctx.session.userId)
    if (userClicks) {
        userClicks.val++
    } else {
        clicks.push({
            user_id: ctx.session.userId,
            val: 1
        })
    }
    await ctx.db.urls.update(id, { clicks })
}

const exportURLStatsInHTML = async ctx => {
    const urls = await ctx.db.urls.find()
    const users = urls.reduce((acc, url) => {
        url.clicks.forEach(click => {
            const key = ctx.i18n.t(url.i18n)
            if (click.user_id in acc) {
                acc[click.user_id][key] = click.val
            } else {
                acc[click.user_id] = {
                    [key]: click.val
                }
            }
        })
        return acc
    }, {})
    const data = Object.entries(users)
        .map(async ([userId, data]) => {
            const user = await ctx.db.users.findById(parseInt(userId, 10))
            if (user) {
                const { first_name, last_name } = user
                return {
                    'Пользователь': `${ first_name } ${ last_name }`,
                    ...data
                }
            }
            return {}
        })
    return json2html(await Promise.all(data))
}

module.exports = {
    nextScene,
    createMailAttachments,
    createMailHTML,
    sendNotification,
    recordUrlClick,
    exportURLStatsInHTML
}