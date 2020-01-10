import IAminoClient, { 
    request, 
    IAminoStorage, 
    IAminoMember, 
    IAminoMessageStorage, 
    IAminoMessage 
} from './../../index'

import * as fs from 'fs';

export enum thread_type {
    private = 0,
    group = 1,
    public = 2
};

/**
* Class for working with chats - threads
*/
export class IAminoThread {

    private community: number;

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
    constructor(client: IAminoClient, communtity?: number, id?: string) {
        this.client = client;
        this.community = communtity;
        this.id = id;

        this.creator = new IAminoMember(this.client, this.community);
    }

    /**
    * Method for receiving chat - thread messages
    * @param {number} [count] number of messages
    */
    public get_message_list(count: number = 10): IAminoMessageStorage {
        var response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.community}/s/chat/thread/${this.id}/message?v=2&pagingType=t&size=${count}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session_token
            }
        }).getBody("utf8"));
        return new IAminoMessageStorage(this.client, response.messageList);
    }

    /**
    * Method for sending text messages to chat - thread
    * @param {string} [content] text to be sent
    */
    public send_message(content: string): IAminoMessage {
        var response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.community}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session_token
            },

            "body": JSON.stringify({
                "type": 0,
                "content": content,
	            "clientRefId": 827027430,
	            "timestamp": new Date().getUTCMilliseconds() 
            })
        }).getBody("utf8"));

        return new IAminoMessage(this.client, response.message, this.community);
    }

    /**
    * Method for sending images to chat - thread
    * @param {string} [image] path to image file
    */
    public send_image(image: string): IAminoMessage {
        var encodedImage = fs.readFileSync(image);
        var response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.community}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session_token
            },

            "body": JSON.stringify({
                "type": 0,
                "content": null,
	            "clientRefId": 827027430,
                "timestamp": new Date().getUTCMilliseconds(),
                "mediaType": 100,
                "mediaUploadValue": encodedImage.toString('base64'),
                "mediaUploadValueContentType": `image/${image.split('.').pop()}`,
                "mediaUhqEnabled": false,
                "attachedObject": null 
            })
        }).getBody("utf8"));

        return new IAminoMessage(this.client, response.message, this.community);
    }

    /**
    * Method for sending audio messages to chat - thread
    * @param {string} [audio] path to audio file
    */
    public send_audio(audio: string): IAminoMessage {
        var encodedAudio = fs.readFileSync(audio);
        var response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.community}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session_token
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
    * Updating the structure, by re-requesting information from the server
    */
    public refresh(): IAminoThread {
        var response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.community}/s/chat/thread/${this.id}`, {
            "headers": {
                "NDCAUTH": 'sid=' + this.client.session_token
            }
        }).getBody("utf8"));
        console.log(response);
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
        
        this.creator.id = object.author.uid;
        this.creator.refresh();

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
            var thread = new IAminoThread(client, element.ndcId, element.threadId);
            thread._set_object(element);
            this.push(thread);
        });
    }
};

