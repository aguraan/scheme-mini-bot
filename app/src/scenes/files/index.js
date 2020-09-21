const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const { getFilesKeyboard } = require('../keyboards')
const { nextScene } = require('../../helpers')

const scene = new Scene('files')

scene.enter(async ctx => {
    const { files } = ctx.session.form
    const keyboard = getFilesKeyboard(ctx, !!files)
    const html = files ? ctx.i18n.t('scenes.add_files.text') : ctx.i18n.t('scenes.new_order.files')
    await ctx.replyWithHTML(html, keyboard)
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.continue'), async ctx => {
    const { form } = ctx.session
    if (!form.files) form.files = []
    await nextScene(ctx)
})

scene.hears(match('buttons.back'), async ctx => await nextScene(ctx))
scene.hears(match('buttons.cancel_order'), async ctx => await ctx.scene.enter('start'))

scene.on('photo', ctx => {
    const { photo } = ctx.message
    const { file_id, file_size } = photo[photo.length-1]
    const { form } = ctx.session
    if (!form.files) form.files = []
    form.files.push({
        type: 'photo',
        id: file_id,
        size: file_size
    })
})

scene.on('document', ctx => {
    const { document } = ctx.message
    const { file_id, file_name, file_size } = document
    const { form } = ctx.session
    if (!form.files) form.files = []
    form.files.push({
        type: 'document',
        id: file_id,
        filename: file_name,
        size: file_size
    })
})

scene.on('audio', ctx => {
    const { audio } = ctx.message
    const { file_id, file_size } = audio
    const { form } = ctx.session
    if (!form.files) form.files = []
    form.files.push({
        type: 'audio',
        id: file_id,
        size: file_size
    })
})

scene.on('video', ctx => {
    const { video } = ctx.message
    const { file_id, file_size } = video
    const { form } = ctx.session
    if (!form.files) form.files = []
    form.files.push({
        type: 'video',
        id: file_id,
        size: file_size
    })
})

scene.on('voice', ctx => {
    const { voice } = ctx.message
    const { file_id, file_size } = voice
    const { form } = ctx.session
    if (!form.files) form.files = []
    form.files.push({
        type: 'voice',
        id: file_id,
        size: file_size
    })
})

scene.on('message', () => {})

module.exports = scene