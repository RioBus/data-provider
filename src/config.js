/* global __dirname, process; */
/**
 * Application configuration
 * You may use it to describe every global configuration data
 */
module.exports = {
    root: __dirname,
    cache: '/tmp/riobus/cache',
    historySize: 10,
    ignoreHistoryCollection: process.env.RIOBUS_IGNORE_HISTORY_COLLECTION || false,
    logs: {
        runtime: '/tmp/riobus/log/runtime.log',
        server: '/tmp/riobus/log/server.log'
    },
    provider: {
        host: 'dadosabertos.rio.rj.gov.br',
        path: {
            bus: {
                'REGULAR': '/apitransporte/apresentacao/rest/index.cfm/onibus',
                'REGULAR-NEW': '/apitransporte/apresentacao/rest/index.cfm/onibus2',
                'BRT': '/apitransporte/apresentacao/rest/index.cfm/brt'
            },
            itinerary: '/apiTransporte/Apresentacao/csv/gtfs/onibus/percursos/gtfs_linha$$-shapes.csv'
        },
        updateInterval:	5000,
        updateTimeout: 10000,
        log: '/tmp/riobus/log/data-server.log'
    },
    database: {
        dbName: process.env.RIOBUS_DB_NAME  || 'nodejs',
        host: process.env.RIOBUS_DB_HOST    || 'localhost',
        port: process.env.RIOBUS_DB_PORT    || 27017,
        user: process.env.RIOBUS_DB_USER    || '',
        pass: process.env.RIOBUS_DB_PASS    || ''
    },
    OSRM: {
        host: process.env.RIOBUS_OSRM_HOST   || 'localhost',
        port: process.env.RIOBUS_OSRM_PORT   || 5000
    }
};