const {
    isArray,
    isObject
} = require('util')

module.exports = json => {
    if (isArray(json)) {
        const cols = []
        for (let i = 0; i < json.length; i++) {
            const item = json[i]
            if (isObject(item)) {
                for (const key in item) {
                    if (cols.indexOf(key) === -1) cols.push(key)
                }
            }
        }
        let html = `<table><thead><tr>
            <th>#</th>
            ${ cols.map(c => `<th>${ c }</th>`).join('') }
        </tr></thead><tbody>`

        for (let i = 0; i < json.length; i++) {
            const item = json[i]
            html += `<tr><td><b>${ i + 1 }</b></td>${ cols.map(c => `<td>${ item[c] != null ? String(item[c]) : '' }</td>`).join('') }</tr>`
        }
        html += '</tbody></table>'
        return html
    }
    return ''
}