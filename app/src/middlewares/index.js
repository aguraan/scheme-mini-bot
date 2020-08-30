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
    editLinkScene
])

const i18n = new TelegrafI18n({
    defaultLanguage: 'ru',
    useSession: true,
    defaultLanguageOnMissing: true,
    directory: path.resolve(__dirname, '..', 'locales')
})

composer.use(session())
composer.use(i18n.middleware())
composer.use(stage.middleware())

composer.command('start', ctx => ctx.scene.enter('start'))
composer.on('message', async ctx => {
    await ctx.reply(ctx.i18n.t('scenes.start.restart'))
})

module.exports = composer
