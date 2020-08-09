import AminoClient, {
    request,
    IAminoStorage,
    AminoMember,
    AminoThread,
    AminoCommunity
} from "./../../index"
import { APIEndpoint } from "../APIEndpoint"
export enum message_type {
    COMMON = 0,
    INVITATION = 103,
    EXIT = 118
};

/**
 * Class for working with messages
 */
export class AminoMessage {

    private client: AminoClient;

    public id: string;
    public content: string;
    public createdTime: string;
    public mediaValue: string;

    public type: message_type;
    public reply_message: AminoMessage;

    public author: AminoMember;
    public thread: AminoThread;

    public community: AminoCommunity;

    /**
     * Message constructor
     * @param {AminoClient} [client] client object
     * @param {AminoCommunity} [communtity] communtiy object
     * @param {AminoThread} [thread] thread object
     * @param {any} [id] message id
     */
    constructor(client: AminoClient, community: AminoCommunity, thread?: AminoThread, id?: string) {
        this.client = client;
        this.community = community;
        this.thread = thread;
        this.id = id;
    }

    /**
     * Method for calling the reply message procedure
     * @param {string} [content] text to be sent
     */
    public reply(content: string): AminoMessage {
        let response = request("POST", APIEndpoint.CompileMessage(this.thread.id,this.community.id), {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "replyMessageId": this.id,
                "type": 0,
                "content": content,
                "clientRefId": 827027430,
                "timestamp": new Date().getTime()
            })
        });

        return new AminoMessage(this.client, this.community)._set_object(response.message, this.thread, this.community.me);
    }

    /**
     * Method for calling the delete message procedure
     */
    public delete(): void {
        let response = request("DELETE", APIEndpoint.CompileMessageWithId(this.id,this.thread.id,this.community.id), {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });
    }

    /**
     * Method for updating the structure, by re-requesting information from the server
     */
    public refresh(): AminoMessage {
        let response = request("GET", APIEndpoint.CompileMessageWithId(this.id,this.thread.id,this.community.id), {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });

        return this._set_object(response.message);
    }

    /**
     * Method for transferring json structure to a message object
     * @param {any} [object] json message structure
     * @param {AminoMember} [author] author object
     * @param {AminoThread} [thread] thread object
     */
    public _set_object(object: any, thread?: AminoThread, author?: AminoMember): AminoMessage {
        this.id = object.messageId;
        this.content = object.content;
        this.createdTime = object.createdTime;
        this.mediaValue = object.mediaValue;

        this.type = object.type;

        this.author = author !== undefined ? author : new AminoMember(this.client, this.community, object.uid).refresh();
        this.thread = thread !== undefined ? thread : new AminoThread(this.client, this.community, object.threadId).refresh();

        if (object.extensions.replyMessageId !== undefined) {
            this.reply_message = new AminoMessage(this.client, this.community, this.thread, object.extensions.replyMessageId);
        }

        return this;
    }
};

/**
 * Class for storing messages objects
 */
export class AminoMessageStorage extends IAminoStorage<AminoMessage> {
    constructor(client: AminoClient, community: AminoCommunity, array?: any) {
        super(client, AminoMessageStorage.prototype);
        if (array) {
            let members: AminoMember[] = community.cache.members.get();
            let threads: AminoThread[] = community.cache.threads.get();
            array.forEach(struct => {
                let member: AminoMember;
                let member_index: number = members.findIndex(filter => filter.id === struct.uid);
                if (member_index !== -1) {
                    member = members[member_index];
                } else {
                    member = new AminoMember(this.client, community, struct.uid).refresh();
                    community.cache.members.push(member);
                    members.push(member);
                }

                let thread: AminoThread;
                let thread_index: number = threads.findIndex(filter => filter.id === struct.threadId);
                if (thread_index !== -1) {
                    thread = threads[thread_index];
                } else {
                    thread = new AminoThread(this.client, community, struct.threadId).refresh();
                    community.cache.threads.push(thread);
                    threads.push(thread);
                }

                this.push(
                    new AminoMessage(this.client, community)._set_object(struct, thread, member)
                );
            });
        }
    }
};

