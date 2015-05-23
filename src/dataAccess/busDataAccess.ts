import IDataAccess = require("./iDataAccess");
import Factory = require("../common/factory");
import Logger = require("../common/logger");
import Config = require("../config");
import HttpRequest = require("../core/httpRequest");
import File = require("../core/file");
import Bus = require("../domain/bus");
import BusList = require("../domain/busList");
import Strings = require("../strings");


/**
 * DataAccess responsible for managing data access to the data stored in the
 * external server.
 *
 * @class ServerDataAccess
 * @constructor
 */
class BusDataAccess implements IDataAccess {

    private logger: Logger;

    public constructor() {
        this.logger = Factory.getServerLogger();
    }

    public handle(data?: any): void {
        if (!data) return this.getBusData();
        this.storeBusData(data);
    }

    /**
     * Retrieves all data from the external storage
     * @returns {BusList}
     */
    private getBusData(): any {
        var body: any = this.requestFromServer();
        if (body.type || !body.DATA) {
            this.logger.error(Strings.dataaccess.server.jsonError);
            return body;
        }
        var data = body.DATA;
        //let columns = body.COLUMNS;
        // columns: ['DATAHORA', 'ORDEM', 'LINHA', 'LATITUDE', 'LONGITUDE', 'VELOCIDADE', 'DIRECAO']

        var dataList: any = {};
        var indexedList: any = {};
        var busCount: number = 0;
        for (var d of data) {
            // Converting external data do the application's pattern
            var bus = new Bus(d[2], d[1], d[5], d[6], d[3], d[4], d[0]);
            if (bus.getLine() === "") bus.setLine(Strings.dataaccess.bus.blankLine);
            var lineExists = Object.keys(dataList).indexOf(bus.getLine().toString());

            if (lineExists < 0) dataList[bus.getLine().toString()] = [];

            var index = dataList[bus.getLine().toString()].length;
            indexedList[bus.getOrder().toString()] = { line: bus.getLine().toString(), position: index };
            dataList[bus.getLine().toString()].push(bus);
            busCount++;
        }

        return new BusList(dataList, indexedList, busCount);
    }

    /**
     * Stores the given data to the local storage
     * @param {String} data
     */
    private storeBusData(data: String): void {
        "use strict";
        var config: any = Config.environment.provider;
        var obj: any = {
            data: data,
            timestamp: (new Date).toLocaleString()
        };
        var file: File = new File(config.dataPath);
        file.write(JSON.stringify(obj));
    }

    /**
     * Does the request to the external server and retrieves the data
     * @returns {any}
     */
    private requestFromServer(): Object {
        "use strict";
        var config: any = Config.environment.provider;
        var http: HttpRequest = new HttpRequest();
        var options: any = {
            headers: {
                'Accept': '*/*',
                'Cache-Control': 'no-cache'
            },
            json: true
        };
        var requestPath: String = 'http://' + config.host + config.path.bus;
        try {
            var response: any = http.get(requestPath, options);
            return this.respondRequest(response);
        } catch (e) {
            this.logger.error(e);
            e.type = Strings.keyword.error;
            return e;
        }
    }

    /**
     * Verifies the request response status and returns the correct output
     * @param {any} response
     * @returns {any}
     */
    private respondRequest(response: any): Object {
        "use strict";
        switch (response.statusCode) {
            case 200:
                this.logger.info(Strings.dataaccess.all.request.ok);
                return JSON.parse(response.getBody());
            case 302:
                this.logger.alert(Strings.dataaccess.all.request.e302);
                return { type: Strings.keyword.error, code: response.statusCode };
            case 404:
                this.logger.alert(Strings.dataaccess.all.request.e404);
                return { type: Strings.keyword.error, code: response.statusCode };
            case 503:
                this.logger.alert(Strings.dataaccess.all.request.e503);
                return { type: Strings.keyword.error, code: response.statusCode };
            default:
                this.logger.error('(' + response.statusCode + ') ' + Strings.dataaccess.all.request.default);
                return { type: Strings.keyword.error, code: response.statusCode };
        }
    }
}
export = BusDataAccess;