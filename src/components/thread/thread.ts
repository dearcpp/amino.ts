import IAminoClient, {
    request,
    IAminoStorage,
    IAminoMember,
    IAminoMessageStorage,
    IAminoMessage,
    IAminoCommunity
} from "./../../index"

import * as fs from "fs";

export enum thread_type {
    private = 0,
    group = 1,
    public = 2
};

/**
* Class for working with chats - threads
*/
export class IAminoThread {

    public community: IAminoCommunity;

    public id: any;
    public icon: string;
    public title: string;
    public description: string;
    public membersQuota: number;
    public membersCount: number;
    public keywords: any;

    public type: thread_type;
    public creator: IAminoMember;

    private client: IAminoClient;
    constructor(client: IAminoClient, communtity: IAminoCommunity, id?: string) {
        this.client = client;
        this.community = communtity;
        this.id = id;
    }

    /**
    * Method for receiving chat - thread messages
    * @param {number} [count] number of messages
    */
    public get_message_list(count: number = 10): IAminoMessageStorage {
        let response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message?v=2&pagingType=t&size=${count}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8"));
        return new IAminoMessageStorage(this.client, this.community, response.messageList);
    }

    /**
    * Method for sending text messages to chat - thread
    * @param {string} [content] text to be sent
    */
    public send_message(content: string): IAminoMessage {
        let response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "type": 0,
                "content": content,
	            "clientRefId": 827027430,
	            "timestamp": new Date().getUTCMilliseconds()
            })
        }).getBody("utf8"));

        return new IAminoMessage(this.client, this.community, response.message);
    }

    /**
    * Method for sending images to chat - thread
    * @param {string} [image] path to image file
    */
    public send_image(image: string): IAminoMessage {
        let encodedImage = fs.readFileSync(image);
        let response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "type": 0,
                "content": null,
	            "clientRefId": 827027430,
                "timestamp": new Date().getUTCMilliseconds(),
                "mediaType": 100,
                "mediaUploadValue": encodedImage.toString("base64"),
                "mediaUploadValueContentType": `image/${image.split(".").pop()}`,
                "mediaUhqEnabled": false,
                "attachedObject": null
            })
        }).getBody("utf8"));

        return new IAminoMessage(this.client, this.community, response.message);
    }

    /**
    * Method for sending audio messages to chat - thread
    * @param {string} [audio] path to audio file
    */
    public send_audio(audio: string): IAminoMessage {
        let encodedAudio = fs.readFileSync(audio);
        let response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "type": 2,
                "content": null,
	            "clientRefId": 827027430,
                "timestamp": new Date().getUTCMilliseconds(),
                "mediaType": 110,
                "mediaUploadValue": encodedAudio,
                "attachedObject": null
            })
        }).getBody("utf8"));

        return new IAminoMessage(this.client, response.message, this.community);
    }

    /**
    * Method for leaving from chat - thread
    */
    public leave(): void {
        let response = JSON.parse(request("DELETE", ` https://service.narvii.com:443/api/v1/x${this.community.id}/s/chat/thread/${this.id}/member/${this.creator.id}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8"));
    }

    /**
    * Updating the structure, by re-requesting information from the server
    */
    public refresh(): IAminoThread {
        let response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8"));
        return this._set_object(response.thread);
    }

    /**
    * Method for transferring json structure to a chat - thread object
    * @param {any} [object] json chat - thread structure
    */
    public _set_object(object: any): IAminoThread {
        this.id = object.threadId;

        this.icon = object.icon;
        this.title = object.title;
        this.description = object.content;
        this.membersQuota = object.membersQuota;
        this.membersCount = object.membersCount;
        this.keywords = object.keywords;

        this.type = object.type;

        this.creator = new IAminoMember(this.client, this.community, object.author.uid).refresh();

        return this;
    }
};

/**
* Class for storing chat - thread objects
*/
export class IAminoThreadStorage extends IAminoStorage<IAminoThread> {
    constructor(client: IAminoClient, array?: any) {
        super(client, IAminoThreadStorage.prototype);
        array.forEach(element => {
            let thread = new IAminoThread(client, element.ndcId, element.threadId);
            thread._set_object(element);
            this.push(thread);
        });
    }
};

