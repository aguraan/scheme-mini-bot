const axios = require('axios')
const { Client } = require("@googlemaps/google-maps-services-js")

const reverseGeocode = ({ latitude, longitude }) => new Promise(async (resolve, reject) => {
    if (latitude && longitude) {
        try {
            const result = await new Client({})
                .reverseGeocode({
                    params: {
                        latlng: {
                            lat: latitude,
                            lng: longitude
                        },
                        language: 'ru',
                        key: process.env.GOOGLE_API_KEY
                    }
                }, axios)
            resolve(result.data.results[0])
        } catch (error) {
            reject(error)
        }
    } else {
        reject(new Error('Require "latitude" or "longitude" parameters'))
    }
})

module.exports = {
    reverseGeocode
}