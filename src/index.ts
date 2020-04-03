import request from "sync-request"

import IAminoStorage from "./components/storage"

import { IAminoCommunity, IAminoCommunityStorage        } from "./components/community/community"
import { IAminoMember, IAminoMemberStorage              } from "./components/member/member"
import { IAminoThread, IAminoThreadStorage, thread_type } from "./components/thread/thread"
import { IAminoMessage, IAminoMessageStorage            } from "./components/message/message"
import { IAminoEvent, IAminoEventHandler                } from "./events/events"

import * as events from 'events'

export {
    request,
    events,
    IAminoStorage,
    IAminoCommunity,
    IAminoCommunityStorage,
    IAminoMember,
    IAminoMemberStorage,
    IAminoThread,
    IAminoThreadStorage,
    thread_type,
    IAminoMessage,
    IAminoMessageStorage
}

export default class IAminoClient {

    public communities: IAminoCommunityStorage;

    public session: string;
    public device: string;

    private event_handler: IAminoEventHandler;

    /**
     * Initialization of the main client
     * @param {string} [login] user login
     * @param {string} [password] user password
     * @param {string} [device] user device id
     */
    constructor(login: string, password: string, device: string) {
        this.device = device;
        this.session = JSON.parse(request("POST", `https://service.narvii.com/api/v1/g/s/auth/login`, {
            "json": {
                "email": login,
                "secret": "0 " + password,
                "deviceID": this.device,
                "clientType": 100,
                "action": "normal",
                "timestamp": new Date().getUTCMilliseconds()
            }
        }).getBody("utf8")).sid;
        this.communities = new IAminoCommunityStorage(this);
        this.event_handler = new IAminoEventHandler(this, new events.EventEmitter());
    }

    /**
     * Set callback to event
     * @param {string} [event] event name
     * @param {any} [callback] event callback
     */
    public on(event: string, callback: any) {
        this.event_handler.emitter.on(event, callback);
    }
};
