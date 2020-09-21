const { Composer } = require('telegraf')
const Stage = require('telegraf/stage')
const session = require('telegraf/session')
const TelegrafI18n = require('telegraf-i18n')
const path = require('path')

const startScene = require('../scenes/start')
const newOrderScene = require('../scenes/new_order')
const cityScene = require('../scenes/city')
const addressScene = require('../scenes/address')
const contactNameScene = require('../scenes/contact_name')
const phoneNumberScene = require('../scenes/phone_number')
const filesScene = require('../scenes/files')
const commentsScene = require('../scenes/comments')
const formatsScene = require('../scenes/formats')
const emailScene = require('../scenes/email')
const orderReviewScene = require('../scenes/order_review')
const adminScene = require('../scenes/admin')
const editLinkScene = require('../scenes/edit_link')
const getFileScene = require('../scenes/get_file')

const composer = new Composer()

const stage = new Stage([
    startScene,
    newOrderScene,
    cityScene,
    addressScene,
    contactNameScene,
    phoneNumberScene,
    filesScene,
    commentsScene,
    formatsScene,
    emailScene,
    orderReviewScene,
    adminScene,
    editLinkScene,
    getFileScene
])

const i18n = new TelegrafI18n({
    defaultLanguage: 'ru',
    useSession: true,
    defaultLanguageOnMissing: true,
    directory: path.resolve(__dirname, '..', 'locales'),
    templateData: {
        validateEmails: emails => {
            return emails.map(({ email, valid }) => {
                return `${ valid ? '✅' : '❌' } ${ email }`
            }).join('\n')
        }
    }
})

composer.use(session())
composer.use(i18n.middleware())
composer.use(stage.middleware())

composer.on('callback_query', async ctx => {
    const data = JSON.parse(ctx.update.callback_query.data)
    if (data) {
        if (data.type === 'timeout') {
            const { message_id } = ctx.update.callback_query.message
            await ctx.deleteMessage(message_id)
        }
        if (data.type === 'email') {
            if (ctx.session.form.emails) {
                const { message_id } = ctx.update.callback_query.message
                ctx.session.form.emails.splice(data.i, 1)
                await ctx.deleteMessage(message_id)
            }
        }
        if (data.type === 'del') {
            if (ctx.session.form.files) {
                const { message_id } = ctx.update.callback_query.message
                await ctx.deleteMessage(message_id)
                ctx.session.form.files.splice(data.i, 1)
            }
        }
        if (data.type === 'edit') {
            ctx.scene.enter(data.val)
        }
    }
})
composer.start(async ctx => await ctx.scene.enter('start'))
// composer.on('photo', ctx => {
//     const { form } = ctx.session
//     if (!form) return
//     const { photo } = ctx.message
//     const { file_id, file_size } = photo[photo.length-1]
//     if (!form.files) form.files = []
//     form.files.push({
//         type: 'photo',
//         id: file_id,
//         size: file_size
//     })
// })

// composer.on('document', ctx => {
//     const { form } = ctx.session
//     console.log(1,{form})
//     if (!form) return
//     const { document } = ctx.message
//     const { file_id, file_name, file_size } = document
//     if (!form.files) form.files = []
//     form.files.push({
//         type: 'document',
//         id: file_id,
//         filename: file_name,
//         size: file_size
//     })
//     console.log(2,{form})
// })

// composer.on('audio', ctx => {
//     const { form } = ctx.session
//     if (!form) return
//     const { audio } = ctx.message
//     const { file_id, file_size } = audio
//     if (!form.files) form.files = []
//     form.files.push({
//         type: 'audio',
//         id: file_id,
//         size: file_size
//     })
// })

// composer.on('video', ctx => {
//     const { form } = ctx.session
//     if (!form) return
//     const { video } = ctx.message
//     const { file_id, file_size } = video
//     if (!form.files) form.files = []
//     form.files.push({
//         type: 'video',
//         id: file_id,
//         size: file_size
//     })
// })

// composer.on('voice', ctx => {
//     const { form } = ctx.session
//     if (!form) return
//     const { voice } = ctx.message
//     const { file_id, file_size } = voice
//     if (!form.files) form.files = []
//     form.files.push({
//         type: 'voice',
//         id: file_id,
//         size: file_size
//     })
// })
composer.on('message', async ctx => {
    await ctx.replyWithHTML(ctx.i18n.t('scenes.start.restart'))
})

module.exports = composer
