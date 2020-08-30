const nodemailer = require('nodemailer')
const {
    EMAIL_ADMIN,
    EMAIL_ADDRESS,
    EMAIL_BOT_LABEL
} = process.env

const sendMail = (oAuth2Client, options) => {
    return new Promise((resolve, reject) => {
        if (oAuth2Client) {
            oAuth2Client.getAccessToken((err, accessToken) => {
                if (err) return reject(err)

                nodemailer.createTransport({ 
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    generateTextFromHTML: true,
                    auth: {
                        type: 'OAuth2',
                        user: EMAIL_ADMIN,
                        accessToken
                    }
                })
                    .sendMail({
                        ...options,
                        from: `"${ EMAIL_BOT_LABEL }" ${ EMAIL_ADDRESS }`,
                        sender: EMAIL_ADDRESS,
                        priority: 'high'
                    })
                        .then(resolve)
                        .catch(reject)
            })
        } else {
            reject(new Error('No "oAuth2Client" passed.'))
        }
    })
}

module.exports = sendMail