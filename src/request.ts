import * as library from "sync-request"
const fetch = require("node-fetch")
const debug: boolean = (process.argv.includes("--requests-debug") || process.argv.includes("-rd"));
export function request(method: library.HttpVerb, url: string | URL, options?: library.Options): any {
    try {
        if (debug) console.log(`[REQUEST]: ${method} : ${url}`);
        return JSON.parse(library.default(method, url, options).getBody("utf8"));
    } catch (error) {
        console.error(error)
        throw new Error(
            error.body
        );
    }
}

export async function requestAsync(method: library.HttpVerb, url: string | URL, options?: library.Options): Promise<any> {
    try {
        if (debug) console.log(`[REQUEST]: ${method} : ${url}`);
        options['method'] = method
        return await fetch(url,options).then(i=>i.json());
    } catch (error) {
        console.error(error)
        throw new Error(
            error.body
        );
    }
}
