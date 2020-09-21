class Loading {
    #animation
    #i = 0
    #timerId = null
    #messageId
    #interval = 500
    #timeout = 60 * 1000

    constructor(animation) {
        this.#animation = animation
    }

    step() {
        const length = this.#animation.length
        return this.#animation[this.#i++ % length]
    }

    async start(ctx) {
        const message = await ctx.reply(this.step())
        this.#messageId = message.message_id
        if (this.#messageId) {
            this.#timerId = setInterval(() => {
                ctx.tg.editMessageText(ctx.chat.id, this.#messageId, null, this.step())
            }, this.#interval)
        }
        setTimeout(() => {
            this.end(ctx)
        }, this.#timeout)
    }

    async end(ctx) {
        clearInterval(this.#timerId)
        this.#timerId = null
        if (this.#messageId) {
            await ctx.deleteMessage(this.#messageId)
            this.#messageId = undefined
        }
    }
}

module.exports = Loading