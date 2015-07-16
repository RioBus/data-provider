class Strings{
	
    public static keyword: any = {
        error: "error"
    };
	
    public static dataaccess: any = {
        bus: {
            blankLine: "indefinido",
            blankSense: "desconhecido",
            creating: "Creating document: ",
            downloading: "Getting data from external server",
            processed: " documents processed successfully.",
            results: " results",
            searching: "Searching for: ",
            total: "Total ",
            updating: "Updating document: "
        },
        itinerary: {
            downloading: "Downloading...",
            requesting: "Requesting from: ",
            retrieving: "Retrieving itineraries from repository",
            searching: "Searching for local data for line itinerary: ",
            stored: "Itinerary stored successfully."
        },
        all: {
            request: {
                error: "An error ocurred.",
                e302: "(302) Server moved temporarily.",
                e404: "(404) Not found.",
                e503: "(503) Server unavailable.",
                ok: "(200) Request OK."
            }
        }
    };
    
    public static error: any = {
        notFound: 404
    }
	
    public static provider: any = {
        data: {
            start: "Starting data provider..."
        }
    };
}
export = Strings;