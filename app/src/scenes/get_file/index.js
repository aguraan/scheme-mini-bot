const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const {
    getNavKeyboard
} = require('../keyboards')
const { fromBase64 } = require('../../helpers')

const scene = new Scene('get_file')

scene.enter(async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('other.get_file_text'), getNavKeyboard(ctx, ['back']))
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.back'), ctx => ctx.scene.enter('admin'))

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    const file = fromBase64(answer)
    if (file) {
        if (file.type === 'photo') {
            return await ctx.replyWithPhoto(file.id)
        }
        if (file.type === 'document') {
            return await ctx.replyWithDocument(file.id)
        }
        if (file.type === 'audio') {
            return await ctx.replyWithAudio(file.id)
        }
        if (file.type === 'voice') {
            return await ctx.replyWithVoice(file.id)
        }
        if (file.type === 'video') {
            return await ctx.replyWithVideo(file.id)
        }
    } else {
        await ctx.replyWithHTML('Can\'t parse file hash.')
    }
})

module.exports = scene