/// <reference path="../../defs/node/node.d.ts" />
/**
 * Creates a new synchronized HttpRequest
 *
 * @class HttpRequest
 * @constructor
 */
class HttpRequest{
    
    private driver: any;

    public constructor(){
        "use strict";
        this.driver = require('sync-request');
    }

    /**
     * Makes GET request
     * @param {String} host Host URL
     * @param {Object} options
     * @returns {*}
     */
    public get(host: string, options?: any): any{
        "use strict";
        return this.driver('GET', host, options);
    }

    /**
     * Makes POST request
     * @param {String} host Host URL
     * @param {Object} options
     * @returns {*}
     */
    public post(host: string, options?: any): any{
        "use strict";
        return this.driver('POST', host, options);
    }

    /**
     * Makes PUT request
     * @param {String} host Host URL
     * @param {Object} options
     * @returns {*}
     */
    public put(host: string, options?: any): any{
        "use strict";
        return this.driver('PUT', host, options);
    }

    /**
     * Makes DELETE request
     * @param {String} host Host URL
     * @param {Object} options
     * @returns {*}
     */
    public delete(host: string, options?: any): any{
        "use strict";
        return this.driver('DELETE', host, options);
    }
}

export = HttpRequest;