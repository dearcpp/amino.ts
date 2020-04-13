import * as library from "sync-request"

const debug: boolean = (process.argv.includes("--requests-debug") || process.argv.includes("-rd"));

export function request(method: library.HttpVerb, url: string | URL, options?: library.Options): any {
    try {
        if (debug) console.log(`[REQUEST]: ${method} : ${url}`);
        return JSON.parse(library.default(method, url, options).getBody("utf8"));
    } catch (error) {
        throw new Error(
            error.body
        );
    }
}
