/**
 * Application configuration
 * You may use it to describe every global configuration data
 */
module.exports = {
    projectRoot: __dirname,
    projectName: 'RioBus',
    main: 'index',
    server: {
        dataProvider: {
            host: 'dadosabertos.rio.rj.gov.br',
            path: {
                bus: '/apiTransporte/apresentacao/rest/index.cfm/onibus',
                itinerary: '/apiTransporte/Apresentacao/csv/gtfs/onibus/percursos/gtfs_linha$$-shapes.csv',
                output: '/tmp/riobus'
            },
            intervalTime: 15000,
            timeout: 20000,
            log: '/tmp/riobus/data-server.log',
            dataPath: '/tmp/riobus/busData.json',
            mock: '/tmp/riobus/mock.busData.json'
        }
    }
};
