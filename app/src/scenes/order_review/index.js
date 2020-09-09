const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const {
    getOrderReviewKeyboard,
    getDeleteInlineKeyboard,
    getEditInlineKeyboard
} = require('../keyboards')
const {
    createMailAttachments,
    createMailHTML,
    isFileSizeSumLess20MB,
    bytesToReadableValue
} = require('../../helpers')
const { EMAIL_ADDRESS } = process.env
const { logWarn } = require('../../util/log')

const scene = new Scene('order_review')

scene.enter(async ctx => {
    const { form } = ctx.session
    const html = ctx.i18n.t('scenes.order_review.result', form)
    await Promise.all(
        form.files
            .map(async (file, i) => {
                const data = { i }
                const extra = { caption:  `${ctx.i18n.t('other.file_size')}: ${ bytesToReadableValue(file.size) }`}
                if (file.type === 'photo') {
                    return await ctx.replyWithPhoto(file.id,
                        getDeleteInlineKeyboard(ctx, data, extra)
                    )
                }
                if (file.type === 'document') {
                    return await ctx.replyWithDocument(file.id,
                        getDeleteInlineKeyboard(ctx, data, extra)
                    )
                }
                if (file.type === 'audio') {
                    return await ctx.replyWithAudio(file.id,
                        getDeleteInlineKeyboard(ctx, data, extra)
                    )
                }
                if (file.type === 'voice') {
                    return await ctx.replyWithVoice(file.id,
                        getDeleteInlineKeyboard(ctx, data, extra)
                    )
                }
                if (file.type === 'video') {
                    return await ctx.replyWithVideo(file.id,
                        getDeleteInlineKeyboard(ctx, data, extra)
                    )
                }
            })
    )
    await ctx.replyWithHTML(html, getOrderReviewKeyboard(ctx))
    if (!isFileSizeSumLess20MB(form.files)) {
        await ctx.replyWithHTML(ctx.i18n.t('validation.file_size'))
    }
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.on('callback_query', async ctx => {
    const data = JSON.parse(ctx.update.callback_query.data)
    if (data && data.type === 'del') {
        const { message_id } = ctx.update.callback_query.message
        await ctx.deleteMessage(message_id)
        ctx.session.form.files.splice(data.i, 1)
    }
    if (data && data.type === 'edit') {
        ctx.scene.enter(data.val)
    }
    if (data && data.type === 'timeout') {
        const { message_id } = ctx.update.callback_query.message
        await ctx.deleteMessage(message_id)
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
    if (isFileSizeSumLess20MB(ctx.session.form.files)) {
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
            ctx.session.form.sended = true
            await ctx.replyWithHTML(ctx.i18n.t('scenes.order_review.success_msg'))
            await ctx.db.users.update(ctx.from.id, { can: true }) // can send orders
        } catch (error) {
            await ctx.replyWithHTML(ctx.i18n.t('scenes.order_review.error_msg'))
            logWarn(error, ctx)
        } finally {
            await ctx.scene.enter('start')
        }
    } else {
        await ctx.replyWithHTML(ctx.i18n.t('validation.file_size'))
    }
})

scene.on('message', () => {})

module.exports = scene