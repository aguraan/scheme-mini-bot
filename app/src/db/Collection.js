const fs = require('fs')
const json2html = require('../util/json2html')

module.exports = class Collection {
    constructor(path) {
        this._path = path
    }
    _read(cb) {
        fs.readFile(this._path, 'utf8', (err, data) => {
            if (err) return cb(err)
            try {
                const coll = JSON.parse(data)
                cb(null, coll)
            } catch (error) {
                cb(error)
            }
        })
    }

    _write(coll, cb) {
        try {
            const data = JSON.stringify(coll)
            fs.writeFile(this._path, data, 'utf8', cb)
        } catch (error) {
            cb(error)
        }
    }

    find(query) {
        return new Promise((resolve, reject) => {
            if (query === null || query === undefined) {
                this._read((err, coll) => {
                    if (err) return reject(err)
                    return resolve(coll)
                })
            } else if (query !== null && typeof query === 'object') {
                this._read((err, coll) => {
                    if (err) return reject(err)
                    const result = []
                    const queryEntries = Object.entries(query)
                    if (!queryEntries.length) return resolve(coll)
                    for (let i = 0; i < coll.length; i++) {
                        const item = coll[i]
                        const found = queryEntries
                            .every(([key, value]) => {
                                return (key in item) && (item[key] === value)
                            })
                        if (found) result.push(item)
                    }
                    resolve(result)
                })
            } else {
                reject(new Error('Bad request'))
            }
        })
    }
    findById(id) {
        return new Promise((resolve, reject) => {
            if (id) {
                this._read((err, coll) => {
                    if (err) return reject(err)
                    const res = coll.find(item => item.id === id)
                    if (res) return resolve(res)
                    resolve(null)
                })
            } else {
                reject(new Error('Bad request'))
            }
        })
    }
    create(item) {
        return new Promise((resolve, reject) => {
            if (item && item.id) {
                this._read((err, coll) => {
                    if (err) return reject(err)
                    coll.push(item)

                    this._write(coll, err => {
                        if (err) return reject(err)
                        resolve(item)
                    })
                })
            } else {
                reject(new Error('Bad request'))
            }
        })
    }
    update(id, update) {
        return new Promise((resolve, reject) => {
            if (id && update) {
                this._read((err, coll) => {
                    if (err) return reject(err)
                    let index = -1
                    const res = coll.find((item, i) => {
                        if (item.id === id) {
                            index = i
                            return true
                        }
                    })
                    if (~index) {
                        const updated = { ...coll[index], ...update }
                        coll.splice(index, 1, updated)
                        this._write(coll, err => {
                            if (err) return reject(err)
                            resolve({ old: res, update, updated })
                        })
                    } else {
                        resolve(null)
                    }
                })
            } else {
                reject(new Error('Bad request'))
            }
        })
    }
    exportHTML() {
        return new Promise((resolve, reject) => {
            this._read((err, coll) => {
                if (err) return reject(err)
                const html = json2html(coll)
                resolve(html)
            })
        })
    }
}