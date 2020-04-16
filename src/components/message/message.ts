import AminoClient, {
    request,
    IAminoStorage,
    AminoMember,
    AminoThread,
    AminoCommunity
} from "./../../index"

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

    public author: AminoMember;
    public thread: AminoThread;

    public community: AminoCommunity;

    /**
     * Message constructor
     * @param {AminoClient} [client] client object
     * @param {AminoCommunity} [communtity] communtiy object
     * @param {AminoThread} [thread] thread object
     * @param {any} [struct] message structure
     */
    constructor(client: AminoClient, community: AminoCommunity, thread?: AminoThread, struct?: any) {
        this.client = client;
        this.community = community;
        this.thread = thread;
        if (struct !== undefined) {
            this._set_object(struct);
        }
    }

    /**
     * Method for calling the reply message procedure
     * @param {string} [content] text to be sent
     */
    public reply(content: string): void {
        let response = request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.thread.id}/message`, {
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
    }

    /**
     * Method for calling the delete message procedure
     */
    public delete(): void {
        let response = request("DELETE", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread/${this.thread.id}/message/${this.id}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });
    }

    /**
     * Method for transferring json structure to a message object
     * @param {any} [object] json message structure
     * @param {AminoMember} [author] author object
     * @param {AminoThread} [thread] thread object
     */
    public _set_object(object: any, author?: AminoMember, thread?: AminoThread): AminoMessage {
        this.id = object.messageId;
        this.content = object.content;
        this.createdTime = object.createdTime;
        this.mediaValue = object.mediaValue;

        this.type = object.type;

        this.author = author !== undefined ? author : new AminoMember(this.client, this.community, object.uid).refresh();
        this.thread = thread !== undefined ? thread : new AminoThread(this.client, this.community, object.threadId).refresh();

        return this;
    }
};

/**
 * Class for storing messages objects
 */
export class IAminoMessageStorage extends IAminoStorage<AminoMessage> {
    constructor(client: AminoClient, community: AminoCommunity, array?: any) {
        super(client, IAminoMessageStorage.prototype);
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
                    new AminoMessage(this.client, community)._set_object(struct, member, thread)
                )
            });
        }
    }
};

