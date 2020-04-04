import AminoClient, {
    request,
    IAminoStorage,
    AminoMember,
    AminoThread,
    AminoCommunity
} from "./../../index"

import * as fs from "fs"


/**
* Class for working with messages
*/
export class AminoMessage {

    public community: AminoCommunity;
    public thread: AminoThread;

    public id: string;
    public content: string;
    public createdTime: string;
    public mediaValue: string;

    public author: AminoMember;

    private client: AminoClient;
    constructor(client: AminoClient, community: AminoCommunity, message: any) {
        this.client = client;
        this.community = community;
        this._set_object(message);
    }

    /**
    * Method for calling the reply message procedure
    * @param {string} [content] text to be sent
    */
    public reply(content: string): void {
        let response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.thread.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "replyMessageId": this.id,
                "type": 0,
                "content": content,
	            "clientRefId": 827027430,
                "timestamp": new Date().getUTCMilliseconds()
            })
        }).getBody("utf8"));
    }

    /**
    * Method for calling the delete message procedure
    */
    public delete(): void {
        let response = JSON.parse(request("DELETE", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.thread.id}/message/${this.id}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8"));
    }

    /**
    * Method for transferring json structure to a message object
    * @param {any} [object] json message structure
    */
    public _set_object(object: any): AminoMessage {
        this.id = object.messageId;
        this.content = object.content;
        this.createdTime = object.createdTime
        this.mediaValue = object.mediaValue;

        this.thread = new AminoThread(this.client, this.community, object.threadId).refresh();
        this.author = new AminoMember(this.client, this.community, object.uid).refresh();

        return this;
    }
};

/**
* Class for storing messages objects
*/
export class AminoMessageStorage extends IAminoStorage<AminoMessage> {
    constructor(client: AminoClient, community: AminoCommunity, array?: any) {
        super(client, AminoMessageStorage.prototype);
        array.forEach(element => {
            this.push(
                new AminoMessage(client, community, element)
            );
        });
    }
};

