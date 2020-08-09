import { request,requestAsync } from "./request"
import IAminoCache from "./components/cache"
import IAminoStorage from "./components/storage"

import EventHandler, { event_type } from "./events/events"

import { AminoCommunity, AminoCommunityStorage as AminoCommunityStorage } from "./components/community/community"
import { AminoMember, AminoMemberStorage } from "./components/member/member"
import { AminoThread, AminoThreadStorage, thread_type } from "./components/thread/thread"
import { AminoMessage, AminoMessageStorage, message_type } from "./components/message/message"
import { AminoBlog, AminoBlogStorage } from "./components/blog/blog"
import { AminoComment, AminoCommentStorage } from "./components/comment/comment"
import { APIEndpoint } from "./components/APIEndpoint"

export {
    request,
    requestAsync,
    IAminoCache,
    IAminoStorage,
    AminoCommunityStorage,
    AminoCommunity,
    AminoMemberStorage,
    AminoMember,
    AminoThreadStorage,
    AminoThread,
    thread_type,
    AminoMessageStorage,
    AminoMessage,
    message_type,
    AminoBlogStorage,
    AminoBlog,
    AminoCommentStorage,
    AminoComment,
    AminoClient,
    APIEndpoint
}

export default class AminoClient {

    public communities: AminoCommunityStorage;

    public session: string;
    public device: string;

    private _eventHandler: EventHandler;

    /**
     * Initialization of the main client
     * @param {string} [login] user login
     * @param {string} [password] user password
     * @param {string} [device] user device id
     */
    constructor(login: string, password: string, device: string) {
        this.device = device;
        this.session = request("POST", APIEndpoint.Login, {
            "json": {
                "email": login,
                "secret": "0 " + password,
                "deviceID": this.device,
                "clientType": 100,
                "action": "normal",
                "timestamp": new Date().getTime()
            }
        }).sid;
        this.communities = new AminoCommunityStorage(this);
    }
    
    public on(event: event_type, callback: any) {
        if (this._eventHandler === undefined) {
            this._eventHandler = new EventHandler(this);
        }
        this._eventHandler.on(event, callback);
    }
    public onMessage(callback: any) {
        if (this._eventHandler === undefined) {
            this._eventHandler = new EventHandler(this);
        }
        this._eventHandler.on("message", callback);
    }
};
