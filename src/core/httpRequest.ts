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
        this.driver = require('request');
    }

    /**
     * Makes GET request
     * @param {String} host Host URL
     * @param {Object} options
     * @returns {*}
     */
    public get(host: string, sync: boolean, callback?: (error: Error, response: any, body: string)=>void): any{
        "use strict";
        var prototype: any = this.driver.get;
        return (sync)? prototype.sync(this, host) : prototype(host, callback);
    }

    /**
     * Makes POST request
     * @param {String} host Host URL
     * @param {Object} options
     * @returns {*}
     */
    public post(host: string, data: any, sync: boolean, callback?: (error: Error, response: any, body: string)=>void): any{
        "use strict";
        var prototype: any = this.driver.post;
        return (sync)? prototype.sync(this, host, {url: host, formData: data}) : prototype({url: host, formData: data}, callback);
    }
}

export = HttpRequest;