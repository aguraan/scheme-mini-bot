const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getEmailInlineKeyboard, getNavKeyboard } = require('../keyboards')
const { nextScene } = require('../../helpers')
const EmailValidator = require('email-deep-validator')
const {
    Loading,
    waitingAnimation
} = require('../../helpers/loading')

const scene = new Scene('emails')

scene.enter(async ctx => {
    const { emails } = ctx.session.form
    const keyboard = getNavKeyboard(ctx, emails ? ['back'] : ['cancel_order'])
    await ctx.replyWithHTML(ctx.i18n.t('scenes.new_order.email'), keyboard)
    if (emails) {
        await Promise.all(
            emails.map((email, i) => ctx.reply(email, getEmailInlineKeyboard(ctx, { i })))
        )
    }
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.back'), async ctx => {
    const { emails } = ctx.session.form
    if (emails && !emails.length) { // is empty array
        await ctx.replyWithHTML(ctx.i18n.t('scenes.new_order.email'))
    } else {
        await nextScene(ctx)
    }
})
scene.hears(match('buttons.cancel_order'), async ctx => await ctx.scene.enter('start'))

scene.on('text', async ctx => {
    const answer = ctx.message.text
    const { emails: existing } = ctx.session.form
    const emails = [...new Set(answer.split(',').map(email => email.trim()))]
        .filter(email => {
            if (existing) return !existing.includes(email)
            return true
        })
    const existingLength = existing ? existing.length : 0
    
    if ((emails.length + existingLength) > 3) return await ctx.replyWithHTML(ctx.i18n.t('validation.max_emails'))

    const emailValidator = new EmailValidator()
    const loading = new Loading(waitingAnimation)
    await ctx.replyWithChatAction('typing')
    await loading.start(ctx)
    const results = await Promise.all(emails.map(email => emailValidator.verify(email)))
    await loading.end(ctx)
    const validatedEmails = results.map(({ wellFormed, validDomain }, i) => {
            return {
                email: emails[i],
                valid: wellFormed && validDomain
            }
        })
    if (validatedEmails.every(({ valid }) => valid)) {
        if (existing) {
            ctx.session.form.emails.push(...emails)
        } else {
            ctx.session.form.emails = emails
        }
        await nextScene(ctx)
    } else {
        await ctx.replyWithHTML(ctx.i18n.t('validation.emails', { emails: validatedEmails }))
    }
})

scene.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('validation.email'))
})

module.exports = scene