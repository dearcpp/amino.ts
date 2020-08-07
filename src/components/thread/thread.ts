import AminoClient, {
    request,
    IAminoStorage,
    AminoMember,
    AminoMessageStorage,
    AminoCommunity,
    AminoMessage
} from "./../../index"

import * as fs from "fs";

declare type image_type = ('image/png' | 'image/jpg');

export enum thread_type {
    PRIVATE = 0,
    GROUP = 1,
    PUBLIC = 2
};

/**
 * Class for working with threads
 */
export class AminoThread {

    private client: AminoClient;

    public id: any;
    public icon: string;
    public title: string;
    public description: string;

    public creator: AminoMember;

    public membersQuota: number;
    public membersCount: number;
    public keywords: any;

    public type: thread_type;

    public community: AminoCommunity;

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
        let response = request("GET", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message?v=2&pagingType=t&size=${count}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });

        return new AminoMessageStorage(this.client, this.community, response.messageList);
    }

    /**
     * Method for sending text messages to thread
     * @param {string} [content] text to be sent
     * @param {string} [image] path to the image
     */
    public send_message(content: string): AminoMessage {
        let response = request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "type": 0,
                "content": content,
                "clientRefId": 827027430,
                "timestamp": new Date().getTime()
            })
        });

        return new AminoMessage(this.client, this.community, this)._set_object(response.message, this, this.community.me);
    }

    /**
     * Method for sending text messages to thread
     * @param {string} [content] text to be sent
     * @param {{path: string, link: string }} [image] extension structure
     */
    public send_extension(content: string, extension: {
        image: Buffer,
        type: image_type,
        link: string
    }): AminoMessage {
        let response = request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "type": 0,
                "content": content,
                "clientRefId": 827027430,
                "timestamp": new Date().getTime(),
                "attachedObject": null,
                "extensions": {
                    "linkSnippetList": [{
                        "link": extension.link,
                        "mediaType": 100,
                        "mediaUploadValue": extension.image.toString("base64"),
                        "mediaUploadValueContentType": extension.type
                    }]
                }
            })
        });

        return new AminoMessage(this.client, this.community, this)._set_object(response.message, this, this.community.me);
    }

    /**
     * Method for sending images to thread
     * @param {string} [image] buffer with image
     * @param {image_type} [type] image type
     */
    public send_image(image: Buffer, type: image_type): AminoMessage {
        let response = request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "type": 0,
                "content": null,
                "clientRefId": 827027430,
                "timestamp": new Date().getTime(),
                "mediaType": 100,
                "mediaUploadValue": image.toString("base64"),
                "mediaUploadValueContentType": type,
                "mediaUhqEnabled": false,
                "attachedObject": null
            })
        });

        return new AminoMessage(this.client, this.community, this)._set_object(response.message, this, this.community.me);
    }

    /**
     * Method for sending audio messages to thread
     * @param {string} [audio] path to audio file
     */
    public send_audio(audio: Buffer): AminoMessage {
        let response = request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/message`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "type": 2,
                "content": null,
                "clientRefId": 827027430,
                "timestamp": new Date().getTime(),
                "mediaType": 110,
                "mediaUploadValue": audio,
                "attachedObject": null
            })
        });

        return new AminoMessage(this.client, this.community, this)._set_object(response.message, this, this.community.me);
    }

    /**
     * Method for leaving from thread
     */
    public join(): void {
        let response = request("POST", ` https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/member/${this.community.me.id}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });
    }

    /**
     * Method for leaving from thread
     */
    public leave(): void {
        let response = request("DELETE", ` https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}/member/${this.community.me.id}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });
    }

    /**
     * Method for updating the structure, by re-requesting information from the server
     */
    public refresh(): AminoThread {
        let response = request("GET", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.id}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });
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
export class AminoThreadStorage extends IAminoStorage<AminoThread> {
    constructor(client: AminoClient, community: AminoCommunity, array?: any) {
        super(client, AminoThreadStorage.prototype);
        if (array) {
            let threads: AminoThread[] = community.cache.threads.get();
            let members: AminoMember[] = community.cache.members.get();
            array.forEach(struct => {
                let thread_index: number = threads.findIndex(filter => filter.id === struct.threadId);
                if (thread_index !== -1) {
                    this.push(threads[thread_index]);
                    return;
                }

                let member_index: number = members.findIndex(filter => filter.id === struct.author.uid);
                let member: AminoMember;
                if (member_index !== -1) {
                    member = members[member_index];
                } else {
                    member = new AminoMember(this.client, community, struct.author.uid).refresh();
                    community.cache.members.push(member);
                    members.push(member);
                }

                let thread = new AminoThread(this.client, community, struct.threadId)._set_object(struct, member);
                this.push(thread);
                threads.push(thread);
                community.cache.threads.push(thread);
            });
        }
    }

    /**
     * Call methods to update in structure objects
     */
    public refresh() {
        for (let i = 0; i < this.length; i++) {
            this[i].refresh();
        }
    }
};

