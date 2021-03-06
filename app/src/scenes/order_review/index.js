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
    bytesToReadableValue,
    sending
} = require('../../helpers')
const { EMAIL_ADDRESS } = process.env
const { logWarn } = require('../../util/log')
const {
    Loading,
    sendingAnimation
} = require('../../helpers/loading')

const scene = new Scene('order_review')

scene.enter(async ctx => {
    const { form } = ctx.session
    const html = ctx.i18n.t('scenes.order_review.result', form)

    for (let i = 0; i < form.files.length; i++) {
        const file = form.files[i]
        const data = { i }
        const extra = { caption:  `${ctx.i18n.t('other.file_size')}: ${ bytesToReadableValue(file.size) }`}
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
        if (file.type === 'audio') {
            await ctx.replyWithAudio(file.id,
                getDeleteInlineKeyboard(ctx, data, extra)
            )
        }
        if (file.type === 'voice') {
            await ctx.replyWithVoice(file.id,
                getDeleteInlineKeyboard(ctx, data, extra)
            )
        }
        if (file.type === 'video') {
            await ctx.replyWithVideo(file.id,
                getDeleteInlineKeyboard(ctx, data, extra)
            )
        }
    }
    await ctx.replyWithHTML(html, getOrderReviewKeyboard(ctx))
    // if (!isFileSizeSumLess20MB(form.files)) {
    //     await ctx.replyWithHTML(ctx.i18n.t('validation.file_size'))
    // }
    // Promise.all(
    //     form.files
    //         .map(async (file, i) => {
    //             const data = { i }
    //             const extra = { caption:  `${ctx.i18n.t('other.file_size')}: ${ bytesToReadableValue(file.size) }`}
    //             if (file.type === 'photo') {
    //                 return await ctx.replyWithPhoto(file.id,
    //                     getDeleteInlineKeyboard(ctx, data, extra)
    //                 )
    //             }
    //             if (file.type === 'document') {
    //                 return await ctx.replyWithDocument(file.id,
    //                     getDeleteInlineKeyboard(ctx, data, extra)
    //                 )
    //             }
    //             if (file.type === 'audio') {
    //                 return await ctx.replyWithAudio(file.id,
    //                     getDeleteInlineKeyboard(ctx, data, extra)
    //                 )
    //             }
    //             if (file.type === 'voice') {
    //                 return await ctx.replyWithVoice(file.id,
    //                     getDeleteInlineKeyboard(ctx, data, extra)
    //                 )
    //             }
    //             if (file.type === 'video') {
    //                 return await ctx.replyWithVideo(file.id,
    //                     getDeleteInlineKeyboard(ctx, data, extra)
    //                 )
    //             }
    //         })
    // )
    // .then(async () => {
    //     await ctx.replyWithHTML(html, getOrderReviewKeyboard(ctx))
    //     if (!isFileSizeSumLess20MB(form.files)) {
    //         await ctx.replyWithHTML(ctx.i18n.t('validation.file_size'))
    //     }
    // })
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.cancel_order'), ctx => ctx.scene.enter('start'))

scene.hears(match('buttons.add_files'), ctx => ctx.scene.enter('files'))

scene.hears(match('buttons.edit'), async ctx => {
    await ctx.replyWithHTML(
        ctx.i18n.t('scenes.order_review.edit'),
        getEditInlineKeyboard(ctx)
    )
})

scene.hears(match('buttons.send'), async ctx => {
    const { city, address, emails } = ctx.session.form
    if (!emails.length) {
        return ctx.scene.enter('emails')
    }
    // if (!isFileSizeSumLess20MB(ctx.session.form.files)) {
    //     return ctx.replyWithHTML(ctx.i18n.t('validation.file_size'))
    // }
    const recipients = [EMAIL_ADDRESS, ...emails]
    let bcc = undefined
    if (ctx.i18n.t('buttons.odessa') === city) {
        const emailGena = 'esset004@gmail.com';
        bcc = emailGena
    }
    const subject = ctx.i18n.t('other.new_order_subject', { city, address })
    try {
        await sending(ctx, async () => {
            await ctx.sendMail({
                to: recipients.join(','),
                bcc,
                subject,
                html: await createMailHTML(ctx),
                attachments: await createMailAttachments(ctx)
            })
        })
        ctx.session.form.sended = true
        await ctx.replyWithHTML(ctx.i18n.t('scenes.order_review.success_msg', { emails: emails.join('\n') }))
        await ctx.db.users.update(ctx.from.id, { can: true }) // can send orders
    } catch (error) {
        await ctx.replyWithHTML(ctx.i18n.t('scenes.order_review.error_msg'))
        logWarn(error, ctx)
    } finally {
        await ctx.scene.enter('start')
    }
})

scene.on('message', () => {})

module.exports = scene