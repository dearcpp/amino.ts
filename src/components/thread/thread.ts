import AminoClient, {
    request,
    IAminoStorage,
    AminoMember,
    AminoMessageStorage,
    AminoMessage,
    AminoCommunity,
    IAminoMemberStorage
} from "./../../index"

import * as fs from "fs";

export enum thread_type {
    private = 0,
    group = 1,
    public = 2
};

/**
* Class for working with threads
*/
export class AminoThread {

    public community: AminoCommunity;

    public id: any;
    public icon: string;
    public title: string;
    public description: string;
    public membersQuota: number;
    public membersCount: number;
    public keywords: any;

    public type: thread_type;
    public creator: AminoMember;

    private client: AminoClient;

    /**
     * Thread constructor
     * @param {AminoClient} [client] client object
     * @param {AminoCommunity} [communtity] communtiy object
     * @param {string} [id] thread id
     */
    constructor(client: AminoClient, communtity: AminoCommunity, id?: string) {
        this.client = client;
        this.community = communtity;
        this.id = id;
    }

    /**
    * Method for receiving thread messages
    * @param {number} [count] number of messages
    */
    public get_message_list(count: number = 10): AminoMessageStorage {
        let response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message?v=2&pagingType=t&size=${count}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8"));
        return new AminoMessageStorage(this.client, this.community, response.messageList);
    }

    /**
    * Method for sending text messages to thread
    * @param {string} [content] text to be sent
    */
    public send_message(content: string): void {
        let response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "type": 0,
                "content": content,
	            "clientRefId": 827027430,
                "timestamp": new Date().getTime()
            })
        }).getBody("utf8"));
    }

    /**
    * Method for sending images to thread
    * @param {string} [image] path to image file
    */
    public send_image(image: string): void {
        let encodedImage = fs.readFileSync(image);
        let response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "type": 0,
                "content": null,
	            "clientRefId": 827027430,
                "timestamp": new Date().getTime(),
                "mediaType": 100,
                "mediaUploadValue": encodedImage.toString("base64"),
                "mediaUploadValueContentType": `image/${image.split(".").pop()}`,
                "mediaUhqEnabled": false,
                "attachedObject": null
            })
        }).getBody("utf8"));
    }

    /**
    * Method for sending audio messages to thread
    * @param {string} [audio] path to audio file
    */
    public send_audio(audio: string): void {
        let encodedAudio = fs.readFileSync(audio);
        let response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "type": 2,
                "content": null,
	            "clientRefId": 827027430,
                "timestamp": new Date().getTime(),
                "mediaType": 110,
                "mediaUploadValue": encodedAudio,
                "attachedObject": null
            })
        }).getBody("utf8"));
    }

    /**
    * Method for ban/kick in thread
    * @param {AminoMember} [member] member object
    * @param {boolean} [rejoin] rejoin flag
    */
    public ban(member: AminoMember, rejoin: boolean): void {
        if(this.creator.id === this.community.me.id) {
            let response = JSON.parse(request("DELETE", `https://service.narvii.com:443/api/v1/x${this.community.id}/s/chat/thread/${this.id}/member/${member.id}?allowRejoin=${Number(rejoin)}`, {
                "headers": {
                    "NDCAUTH": "sid=" + this.client.session
                }
            }).getBody("utf8"));
        } else {
            throw Error("You do not have sufficient permissions to perform this operation.");
        }
    }

    /**
    * Method for leaving from thread
    */
    public leave(): void {
        let response = JSON.parse(request("DELETE", ` https://service.narvii.com:443/api/v1/x${this.community.id}/s/chat/thread/${this.id}/member/${this.creator.id}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8"));
    }

    /**
    * Method for updating the structure, by re-requesting information from the server
    */
    public refresh(): AminoThread {
        let response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8"));
        return this._set_object(response.thread);
    }

    /**
    * Method for transferring json structure to a thread object
    * @param {any} [object] json thread structure
    * @param {AminoMember} [creator] creator object
    */
    public _set_object(object: any, creator?: AminoMember): AminoThread {
        this.id = object.threadId;

        this.icon = object.icon;
        this.title = object.title;
        this.description = object.content;
        this.membersQuota = object.membersQuota;
        this.membersCount = object.membersCount;
        this.keywords = object.keywords;

        this.type = object.type;

        this.creator = creator !== undefined ? creator : new AminoMember(this.client, this.community, object.author.uid).refresh();

        return this;
    }
};

/**
* Class for storing thread objects
*/
export class IAminoThreadStorage extends IAminoStorage<AminoThread> {

    public member_cache: IAminoMemberStorage;

    constructor(client: AminoClient, community: AminoCommunity, array?: any) {
        super(client, IAminoThreadStorage.prototype);
        if(array !== undefined) {
            this.member_cache = new IAminoMemberStorage(client);
            array.forEach(element => {
                let member: number = this.member_cache.findIndex(member => member.id === element.author.uid);
                this.push(
                    new AminoThread(client, community, element)._set_object(element,
                        member !== -1 ? this.member_cache[member] : this.member_cache[
                            this.member_cache.push(new AminoMember(client, community, element.author.uid).refresh())
                        ]
                    )
                );
            });
        }
    }
};

