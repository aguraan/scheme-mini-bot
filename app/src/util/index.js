const isEmpty = obj => {
    for (const key in obj)
        if (obj.hasOwnProperty(key))
            return false
    return true
}

const forEachAsync = (arr, func) => {
    if (Array.isArray(arr)) {
        const { length } = arr
        if (length) {
            let i = 0
            const cb = () => {
                if (i < length)
                    func(arr[i], i++, arr, cb)
            }
            cb()
        }
    }
}

module.exports = {
    isEmpty,
    forEachAsync
}