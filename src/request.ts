import * as library from "sync-request"

export function request(method: library.HttpVerb, url: string | URL, options?: library.Options): any {
    return JSON.parse(library.default(method, url, options).getBody("utf8"));
}
