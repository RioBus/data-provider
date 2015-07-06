/// <reference path="../defs/node/node.d.ts" />
class Config {
	
	public static rootPath: string = __dirname;

	public static log: any = {
		runtime: "./runtime.log",
		server: "./server.log"
	}
	
	public static errorMailMessage: any = {
		from: "RioBus <error-report@riob.us>",
		to: "",
		subject: "[ERROR] Server down!",
		text: "An error ocurred in the data-provider service\n\n$$\n\nand it shut the server down."
	}

	public static isProduction(): Boolean {
		return process.argv.indexOf("--production") > -1;
	}
	
	public static environment: any = {
		provider: {
			host: 			"dadosabertos.rio.rj.gov.br",
			path: {
                bus: 		"/apiTransporte/apresentacao/rest/index.cfm/onibus",
                itinerary: 	"/apiTransporte/Apresentacao/csv/gtfs/onibus/percursos/gtfs_linha$$-shapes.csv"
            },
			updateInterval:	5000,
            timeout: 		20000,
            log: 			"/tmp/riobus/data-server.log"
		},
		mailServer: {
			user: "",
			password: "",
			host: "smtp.gmail.com",
			ssl: true
		},
		development: {
			database: {
				driver: "mongodb",
				config: [
					{
						dbName: "riobus",
						host: "mongo",
						user: "riobus",
						pass: "riobus",
						port: "8529"
					}
				]
			}
		},
		production: {
			database: {
				databaseName: "riobus",
				driver: "core/database/driver/mongodb",
				url: "http://riobus:riobus@arango:8529"
			}
		}
	}
}

export = Config;