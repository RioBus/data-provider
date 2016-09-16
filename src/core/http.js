'use strict';
const request = require('request');

var optionsObj = {
    method: 'GET',
    simple: true,
    resolveWithFullResponse: true,
    json: true
};

/**
 * Creates a new synchronized HttpRequest
 * @class {Http}
 */
class Http {
    
    /**
     * Makes requests through Options object
     * @param {Object} options - Options object
     * @returns {Promise}
     */
    static request(options) {
        var data = JSON.parse(JSON.stringify(optionsObj));
        Object.keys(options).forEach( (key) => {
            data[key] = options[key];
        });
        return new Promise( (resolve, reject) => {
            request(data, (error, response) => {
                if (error) reject(error);
                else resolve(response);
            });
        });
    }

    /**
     * Makes GET request
     * @param {string} host - Host URL
     * @param {Object} headers - Headers to be set (Optional)
     * @param {number} timeout - Timeout for the request in milliseconds (Optional)
     * @returns {Promise}
     */
    static get(host, headers, timeout) {
        let obj = { uri: host };
        if(headers) obj.headers = headers;
        if(timeout) obj.timeout = timeout;
        return Http.request(obj);
    }

    /**
     * Makes POST request
     * @param {string} host - Host URL
     * @param {Object} data - Data to be sent
     * @param {Object} headers - Headers to be set (Optional)
     * @returns {Promise}
     */
    static post(host, data, headers) {
        return Http.request({ method: 'POST', uri: host, body: data, headers: headers || {} });
    }

    /**
     * Makes POST request
     * @param {string} host - Host URL
     * @param {Object} data - Data to be sent
     * @returns {Promise}
     */
    static postForm(host, data) {
        return request.post({ url: host, formData: data });
    }

    /**
     * Makes PUT request
     * @param {string} host - Host URL
     * @param {Object} data - Data to be sent
     * @param {Object} headers - Headers to be set (Optional)
     * @returns {Promise}
     */
    static put(host, data, headers) {
        return Http.request({ method: 'PUT', uri: host, body: data, headers: headers || {} });
    }

    /**
     * Makes DELETE request
     * @param {String} host - Host URL
     * @param {Object} data - Data to be sent (Optional)
     * @param {Object} headers - Headers to be set (Optional)
     * @returns {Promise}
     */
    static delete(host, data, headers) {
        return Http.request({ method: 'DELETE', uri: host, body: data || {}, headers: headers || {} });
    }
}
module.exports = Http;