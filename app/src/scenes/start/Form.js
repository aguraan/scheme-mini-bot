const { EventEmitter } = require('events')
class Form extends EventEmitter {
    #city = ''
    #address = ''
    #contact_name = ''
    #phone_number = ''
    #files = null
    #comments = ''
    #formats = ''
    #email = ''
    #timerId = undefined

    #timeout = function() {
        this.clearTimeout()
        this.#timerId = setTimeout(() => {
            this.emit('timeout')
        }, process.env.FORM_TIMEOUT * 60 * 1000)
    }
    constructor() {
        super()
        this.#timeout()
        Object.defineProperties(this, {
            city: {
                get() {
                    return this.#city
                },
                set(val) {
                    this.#timeout()
                    this.#city = val
                },
                enumerable: true
            },
            address: {
                get() {
                    return this.#address
                },
                set(val) {
                    this.#timeout()
                    this.#address = val
                },
                enumerable: true
            },
            contact_name: {
                get() {
                    return this.#contact_name
                },
                set(val) {
                    this.#timeout()
                    this.#contact_name = val
                },
                enumerable: true
            },
            phone_number: {
                get() {
                    return this.#phone_number
                },
                set(val) {
                    this.#timeout()
                    this.#phone_number = val
                },
                enumerable: true
            },
            files: {
                get() {
                    return this.#files
                },
                set(val) {
                    this.#timeout()
                    this.#files = val
                },
                enumerable: true
            },
            comments: {
                get() {
                    return this.#comments
                },
                set(val) {
                    this.#timeout()
                    this.#comments = val
                },
                enumerable: true
            },
            formats: {
                get() {
                    return this.#formats
                },
                set(val) {
                    this.#timeout()
                    this.#formats = val
                },
                enumerable: true
            },
            email: {
                get() {
                    return this.#email
                },
                set(val) {
                    this.#timeout()
                    this.#email = val
                },
                enumerable: true
            },
            sended: {
                value: false,
                enumerable: false
            },
            _events: { enumerable: false },
            _eventsCount: { enumerable: false },
            _maxListeners: { enumerable: false }
        })
    }

    clearTimeout() {
        if (this.#timerId) clearTimeout(this.#timerId)
        this.#timerId = undefined
    }
}

module.exports = Form