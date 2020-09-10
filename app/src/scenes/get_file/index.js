const Scene = require('telegraf/scenes/base')
const { match } = require('telegraf-i18n')
const {
    getNavKeyboard
} = require('../keyboards')

const scene = new Scene('get_file')

scene.enter(async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('other.get_file_text'), getNavKeyboard(ctx, ['back']))
})

scene.command('start', async ctx => await ctx.scene.enter('start'))

scene.hears(match('buttons.back'), ctx => ctx.scene.enter('admin'))

scene.on('text', async ctx => {
    const answer = ctx.message.text.trim()
    const json = Buffer.from(answer, 'base64').toString()
    let file = null
    try {
        file = JSON.parse(json)
    } catch (error) {
        throw new Error('Can\'t parse json')
    }
    if (file) {
        if (file.type === 'photo') {
            return ctx.replyWithPhoto(file.id)
        }
        if (file.type === 'document') {
            return ctx.replyWithDocument(file.id)
        }
        if (file.type === 'audio') {
            return ctx.replyWithAudio(file.id)
        }
        if (file.type === 'voice') {
            return ctx.replyWithVoice(file.id)
        }
        if (file.type === 'video') {
            return ctx.replyWithVideo(file.id)
        }
    }
})

module.exports = scene