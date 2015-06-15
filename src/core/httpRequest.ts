/// <reference path="../../defs/node/node.d.ts" />
var DeAsync = require("deasync");
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
    public get(host: string, callback?: (error: Error, response: any, body: string)=>void): void|any{
        "use strict";
        if(callback) this.driver.get(host, callback);
        else{
            var get: any = DeAsync(this.driver.get);
            var output: any = get(host);
            if(output.stack!==undefined) throw output;
            else return output;
        }
    }

    /**
     * Makes POST request
     * @param {String} host Host URL
     * @param {Object} options
     * @returns {*}
     */
    public post(host: string, data: any, callback?: (error: Error, response: any, body: string)=>void): any{
        "use strict";
        if(callback) this.driver.post({url: host, formData: data}, callback);
        else{
            var post: any = DeAsync(this.driver.post);
            var output: any = post({url: host, formData: data});
            if(output.stack!==undefined) throw output;
            else return output;
        }
    }
}

export = HttpRequest;