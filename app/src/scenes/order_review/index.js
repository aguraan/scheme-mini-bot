const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const {
    getOrderReviewKeyboard,
    getDeleteInlineKeyboard,
    getEditInlineKeyboard
} = require('../keyboards')
const {
    createMailAttachments,
    createMailHTML
} = require('../../helpers')
const { EMAIL_ADDRESS } = process.env

const scene = new Scene('order_review')

scene.enter(async ctx => {
    const { form } = ctx.session
    const html = ctx.i18n.t('scenes.order_review.result', form)
    await ctx.replyWithHTML(html, getOrderReviewKeyboard(ctx))
    form.files
        .forEach(async (file, i) => {
            const data = { i }
            const extra = { caption: file.caption }
            if (file.type === 'photo') {
                await ctx.replyWithPhoto(file.id,
                    getDeleteInlineKeyboard(ctx, data, extra)
                )
            }
            if (file.type === 'document') {
                await ctx.replyWithDocument(file.id,
                    getDeleteInlineKeyboard(ctx, data, extra)
                )
            }
        })
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.on('callback_query', async ctx => {
    const data = JSON.parse(ctx.update.callback_query.data)
    if (data && data.type === 'del') {
        await ctx.deleteMessage(ctx.update.callback_query.message.message_id)
        ctx.session.form.files.splice(data.i, 1)
    }
    if (data && data.type === 'edit') {
        ctx.scene.enter(data.val)
    }
})

scene.hears(match('buttons.cancel'), ctx => ctx.scene.enter('start'))

scene.hears(match('buttons.add_files'), ctx => ctx.scene.enter('files'))

scene.hears(match('buttons.edit'), async ctx => {
    await ctx.replyWithHTML(
        ctx.i18n.t('scenes.order_review.edit'),
        getEditInlineKeyboard(ctx)
    )
})

scene.hears(match('buttons.send'), async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('other.sending'))
    try {
        const { city, address, email } = ctx.session.form
        const recipients = [EMAIL_ADDRESS, email].join(', ')
        const subject = ctx.i18n.t('other.new_order_subject', { city, address })
        await ctx.sendMail({
            to: recipients,
            subject,
            html: await createMailHTML(ctx),
            attachments: await createMailAttachments(ctx)
        })
        await ctx.replyWithHTML(ctx.i18n.t('scenes.order_review.success_msg'))
    } catch (error) {
        await ctx.replyWithHTML(ctx.i18n.t('scenes.order_review.error_msg'))
    } finally {
        await ctx.scene.enter('start')
    }
})

scene.on('message', () => {})

module.exports = scene