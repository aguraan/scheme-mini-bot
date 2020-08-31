const path = require('path')
const Collection = require('./Collection')

module.exports = {
    users: new Collection(path.resolve(__dirname, './data/users.json')),
    urls: new Collection(path.resolve(__dirname, './data/urls.json'))
}