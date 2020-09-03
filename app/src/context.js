const {
    createOAuth2Client,
    sendMail
} = require('./google')
const context = Object.create(null)

context.isAdmin = function() {
    const { ADMIN_IDS } = process.env
    if (ADMIN_IDS) {
        return ADMIN_IDS.split(',').map(str => parseInt(str, 10)).some(id => this.from.id === id)
    }
    return false
}

context.db = require('./db')

context.oAuth2Client = createOAuth2Client()

context.sendMail = async function(options) {
    await sendMail(this.oAuth2Client, options)
}

module.exports = context

