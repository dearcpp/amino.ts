import request from 'sync-request'

import IAminoStorage from './components/storage'

import { IAminoCommunity, IAminoCommunityStorage        } from './components/community/community'
import { IAminoMember, IAminoMemberStorage              } from './components/member/member'
import { IAminoThread, IAminoThreadStorage, thread_type } from './components/thread/thread'
import { IAminoMessage, IAminoMessageStorage            } from './components/message/message'

export {
    request,
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

    /**
     * Initialization of the main client
     * @param {string} [login] user login
     * @param {string} [password] user password
     * @param {string} [device] user device id
     */
    public session_token: string;
    constructor(login: string, password: string, device: string) {        
        this.session_token = JSON.parse(request("POST", `https://service.narvii.com/api/v1/g/s/auth/login`, {
            "json": {
                "email": login,
                "secret": "0 " + password,
                "deviceID": device,
                "clientType": 100,
                "action": "normal",
                "timestamp": new Date().getUTCMilliseconds() 
            }
        }).getBody("utf8")).sid;
        this.communities = new IAminoCommunityStorage(this);
    }
};