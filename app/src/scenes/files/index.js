const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getFilesKeyboard } = require('../keyboards')
const { nextScene } = require('../../helpers')
const { print } = require('../../util/log')

const scene = new Scene('files')

scene.enter(async ctx => {
    const { files } = ctx.session.form
    const keyboard = getFilesKeyboard(ctx, !!files)
    const html = files ? ctx.i18n.t('scenes.add_files.text') : ctx.i18n.t('scenes.new_order.files')
    await ctx.replyWithHTML(html, keyboard)
})

scene.hears(match('buttons.continue'), async ctx => {
    const { form } = ctx.session
    if (!form.files) form.files = []
    await nextScene(ctx)
})

scene.hears(match('buttons.back'), async ctx => await nextScene(ctx))
scene.hears(match('buttons.cancel'), async ctx => await ctx.scene.enter('start'))

scene.on('photo', ctx => {
    const { caption, photo } = ctx.message
    const { file_id, file_unique_id } = photo[photo.length-1]
    const { form } = ctx.session
    if (!form.files) form.files = []
    form.files.push({
        type: 'photo',
        cid: file_unique_id,
        id: file_id,
        caption
    })
})

scene.on('document', ctx => {
    const { caption, document } = ctx.message
    const { file_id, file_name } = document
    const { form } = ctx.session
    if (!form.files) form.files = []
    form.files.push({
        type: 'document',
        id: file_id,
        filename: file_name,
        caption
    })
})

scene.on('message', () => {})

module.exports = scene