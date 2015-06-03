class Strings{
	
    public static keyword: any = {
        error: "error"
    };
	
    public static core: any = {
        router: {
            registered: "Resource registered: ",
            serving: "Serving route ",
            start: "Server started in http://"
        }
    };
	
    public static resource: any = {
        main: {
            log: {
                referrer: "User\"s referrer is: "
            }
        },
        parent: {
            response: {
                error: {
                    message: "Operation not implemented"
                }
            }
        }
    };
	
    public static business: any = {
        search: {
            platform: {
                web: "Site",
                mobile: "Mobile",
                legacy: "Legacy",
                notSet: "Not set"
            },
            response: {
                codeNotSent: "Any code was informed"
            },
            request: {
                lines: "Requesting line(s): ",
                orders: "Requesting orders(s): ",
                all: "Requesting all lines",
                samples: "Requesting samples"
            }
        }
    };
	
    public static dataaccess: any = {
        bus: {
            searching: "Searching for: ",
            results: " results",
            total: "Total ",
            blankLine: "indefinido",
            blankSense: "desconhecido",
            creating: "Creating document: ",
            updating: "Updating document: ",
        },
        itinerary: {
            searching: "Searching for local data for line itinerary: ",
            requesting: "Requesting from: ",
            stored: "Itinerary stored successfully.",
            downloading: "Downloading..."
        },
        log: {
            reading: "Reading log: ",
            totalLines: "Total lines: "
        },
        server: {
            jsonError: "JSON response error.",
            mock: {
                fill: "Filling mock file",
                create: "Creating mock file"
            }
        },
        all: {
            request: {
                ok: "(200) Request OK.",
                e302: "(302) Server moved temporarily.",
                e404: "(404) Not found.",
                e503: "(503) Server unavailable.",
                default: "An error ocurred."
            }
        }
    };
    
    public static error: any = {
        notFound: 404
    }
	
    public static provider: any = {
        data: {
            start: "Starting data provider..."
        },
        rest: {
            start: "Starting the server..."
        }
    };
	
    public static analytics: any = {
        event: {
            restHit: "REST+Hit"
        },
        label: {
            rest: "REST",
            busCode: "Bus Code"
        }
    };
}
export = Strings;