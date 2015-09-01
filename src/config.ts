declare var __dirname, process;
class Config {
	
	public static rootPath: string = __dirname;

	public static log: any = {
		runtime: "/tmp/riobus/log/runtime.log",
		server: "/tmp/riobus/log/server.log"
	}
	
	public static errorMailMessage: any = {
		from: 	 "RioBus <error-report@riob.us>",
		to: 	 "",
		subject: "[ERROR] Server down!",
		text: 	 "An error ocurred in the data-provider service\n\n$$\n\nand it shut the server down."
	}

	public static isProduction(): Boolean {
		return process.argv.indexOf("--production") > -1;
	}
	
	public static environment: any = {
		provider: {
			host: 			"dadosabertos.rio.rj.gov.br",
			path: {
				bus: {
					"REGULAR": "/apitransporte/apresentacao/rest/index.cfm/onibus",
					"BRT": "/apitransporte/apresentacao/rest/index.cfm/brt"
				},
                itinerary: 	"/apiTransporte/Apresentacao/csv/gtfs/onibus/percursos/gtfs_linha$$-shapes.csv"
            },
			updateInterval:	5000,
            log: 			"/tmp/riobus/log/data-server.log"
		},
		mailServer: {
			user: 	  "",
			password: "",
			host: 	  "smtp.gmail.com",
			ssl: 	  true
		},
		development: {
			database: {
				driver: "mongodb",
				config: {
					dbName: "riobus",
					host: "mongo",
					user: "",
					pass: "",
					port: "27017"
				}
			}
		},
		production: {
			database: {
				driver: "mongodb",
				config: {
					dbName: "riobus",
					host: "mongo",
					user: "riobus",
					pass: "riobus",
					port: "27017"
				}
			}
		}
	}
}

export = Config;