export var config = undefined;
export var API = undefined;

export function initConfig(callback) {
    if (process.env.NODE_ENV === 'development') {
        import('./config').then((Config) => {
            config = { clientId: Config.Config.clientId };
            API = { key: Config.API.key };
            if (callback) callback(); 
        });
    }
    else if (process.env.NODE_ENV === 'production') {
        config = { clientId: process.env.REACT_APP_CLIENTID };
        API = { key: process.env.REACT_APP_KEY };
        if (callback) { callback(); }
    }
    else { console.log("!!!IMPORTANT!!! No env var found"); }
}

export function secretprint() {
    console.log("attempting to print secret", config, " api: ", API);
}