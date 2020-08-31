const { google } = require('googleapis')
const path = require('path')
const fs = require('fs')
const sendMail = require('./sendMail')
const { reverseGeocode } = require('./geocode')

const SCOPES = [
    'https://mail.google.com/'
]

const TOKEN_PATH = path.resolve(__dirname, './credentials/token.json')

const createOAuth2Client = () => {
    const content = fs.readFileSync(path.resolve(__dirname, './credentials/client_secret.json'), 'utf-8')
    const credentials = JSON.parse(content)
    const {client_secret, client_id, redirect_uris} = credentials.web
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    try {
        const token = fs.readFileSync(TOKEN_PATH, 'utf-8')
        oAuth2Client.setCredentials(JSON.parse(token))
    } catch (error) {
        console.error('You need to authorize manually')
    } finally {
        return oAuth2Client
    }
}
const getAuthURL = (oAuth2Client) => {
    if (oAuth2Client) {
        return oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent'
        })
    }
    return ''
}
const authorize = (oAuth2Client, code) => {
    return new Promise((resolve, reject) => {
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return reject(err)
            oAuth2Client.setCredentials(token)
            fs.writeFile(TOKEN_PATH, JSON.stringify(token, null, 2), 'utf8', err => {
                if (err) return reject(err)
                resolve()
            })
        })
    })
}

module.exports = {
    getAuthURL,
    createOAuth2Client,
    authorize,
    sendMail,
    reverseGeocode
}