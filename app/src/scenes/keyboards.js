const Markup = require('telegraf/markup')

const getMainKeyboard = ctx => {
    return Markup.keyboard([
        [ctx.i18n.t('buttons.new_order')],
        [ctx.i18n.t('buttons.info')]
    ]).resize().extra()
}

const getAdminKeyboard = ctx => {
    return Markup.keyboard([
        [ctx.i18n.t('buttons.auth')],
        [ctx.i18n.t('buttons.export')],
        [ctx.i18n.t('buttons.edit_links')],
        [ctx.i18n.t('buttons.url_stats')],
        [ctx.i18n.t('buttons.exit')]
    ]).resize().extra()
}

const getAuthURLInlineKeyboard = (ctx, url) => {
    return Markup.inlineKeyboard([
        Markup.urlButton(ctx.i18n.t('inline.open_window'), url)
    ]).extra()
}

const getInfoInlineKeyboard = ctx => {
    const type = { type: 'info' }
    return Markup.inlineKeyboard([
        [Markup.callbackButton(ctx.i18n.t('inline.process'), JSON.stringify({ ...type, val: 'process' }))],
        [Markup.callbackButton(ctx.i18n.t('inline.examples'), JSON.stringify({ ...type, val: 'examples' }))],
        [Markup.callbackButton(ctx.i18n.t('inline.prices'), JSON.stringify({ ...type, val: 'prices' }))],
    ]).extra()
}

const getNewOrderKeyboard = ctx => {
    return Markup.keyboard([
        [ctx.i18n.t('buttons.continue')],
        [ctx.i18n.t('buttons.back')]
    ]).resize().extra()
}

const getCityKeyboard = (ctx, back) => {
    return Markup.keyboard([
        [ctx.i18n.t('buttons.kiev'), ctx.i18n.t('buttons.odessa')],
        back ? [ctx.i18n.t('buttons.back')] : [ctx.i18n.t('buttons.cancel')]
    ]).resize().extra()
}

const getCancelKeyboard = (ctx, back) => {
    return Markup.keyboard([
        back ? [ctx.i18n.t('buttons.back')] : [ctx.i18n.t('buttons.cancel')]
    ]).resize().extra()
}

const getFilesKeyboard = (ctx, back) => {
    return Markup.keyboard([
        [ctx.i18n.t('buttons.continue')],
        back ? [ctx.i18n.t('buttons.back')] : [ctx.i18n.t('buttons.cancel')]
    ]).resize().extra()
}

const getFormatsKeyboard = (ctx, back) => {
    const kb = [
        [ctx.i18n.t('buttons.not_needed')],
        [ctx.i18n.t('buttons.b3d'), ctx.i18n.t('buttons.pdf')],
        [ctx.i18n.t('buttons.b3d_pdf')],
        back ? [ctx.i18n.t('buttons.back')] : [ctx.i18n.t('buttons.cancel')]
    ]
    return Markup.keyboard(kb).resize().extra()
}

const getOrderReviewKeyboard = ctx => {
    return Markup.keyboard([
        [ctx.i18n.t('buttons.send')],
        [ctx.i18n.t('buttons.add_files')],
        [ctx.i18n.t('buttons.cancel'), ctx.i18n.t('buttons.edit')]
    ]).resize().extra()
}

const getDeleteInlineKeyboard = (ctx, value, extra) => {
    const data = JSON.stringify({
        type: 'del',
        ...value
    })
    return Markup.inlineKeyboard([
        [Markup.callbackButton(ctx.i18n.t('inline.delete'), data)]
    ]).extra(extra)
}

const getEditInlineKeyboard = ctx => {
    const edit = { type: 'edit' }
    return Markup.inlineKeyboard([
        [Markup.callbackButton(ctx.i18n.t('inline.city'), JSON.stringify({ ...edit, val: 'city' }))],
        [Markup.callbackButton(ctx.i18n.t('inline.address'), JSON.stringify({ ...edit, val: 'address' }))],
        [Markup.callbackButton(ctx.i18n.t('inline.contact_name'), JSON.stringify({ ...edit, val: 'contact_name' }))],
        [Markup.callbackButton(ctx.i18n.t('inline.phone_number'), JSON.stringify({ ...edit, val: 'phone_number' }))],
        [Markup.callbackButton(ctx.i18n.t('inline.comments'), JSON.stringify({ ...edit, val: 'comments' }))],
        [Markup.callbackButton(ctx.i18n.t('inline.formats'), JSON.stringify({ ...edit, val: 'formats' }))],
        [Markup.callbackButton(ctx.i18n.t('inline.email'), JSON.stringify({ ...edit, val: 'email' }))],
    ]).extra()
}

const getEditLinksInlineKeyboard = (ctx, urls) => {
    const type = { type: 'e_link' }
    return Markup.inlineKeyboard(
        urls.map(url => {
            return [Markup.callbackButton(ctx.i18n.t(url.i18n), JSON.stringify({ ...type, id: url.id }))]
        })
    ).extra()
}

module.exports = {
    getMainKeyboard,
    getAdminKeyboard,
    getInfoInlineKeyboard,
    getNewOrderKeyboard,
    getCityKeyboard,
    getCancelKeyboard,
    getFilesKeyboard,
    getFormatsKeyboard,
    getOrderReviewKeyboard,
    getDeleteInlineKeyboard,
    getEditInlineKeyboard,
    getAuthURLInlineKeyboard,
    getEditLinksInlineKeyboard
}