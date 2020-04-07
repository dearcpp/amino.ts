import AminoClient, {
    request,
    IAminoStorage,
    AminoMember,
    AminoThread,
    AminoCommunity,
    IAminoThreadStorage,
    IAminoMemberStorage
} from "./../../index"

/**
* Class for working with messages
*/
export class AminoMessage {

    private client: AminoClient;

    public id: string;
    public content: string;
    public createdTime: string;
    public mediaValue: string;

    public author: AminoMember;
    public thread: AminoThread;

    public community: AminoCommunity;

    /**
     * Message constructor
     * @param {AminoClient} [client] client object
     * @param {AminoCommunity} [communtity] communtiy object
     * @param {any} [message] json message structure
     */
    constructor(client: AminoClient, community: AminoCommunity, message?: any) {
        this.client = client;
        this.community = community;
        if (message !== undefined) {
            this._set_object(message);
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
        this.createdTime = object.createdTime
        this.mediaValue = object.mediaValue;

        this.author = author !== undefined ? author : new AminoMember(this.client, this.community, object.uid).refresh();
        this.thread = thread !== undefined ? thread : new AminoThread(this.client, this.community, object.threadId).refresh();

        return this;
    }
};

/**
* Class for storing messages objects
*/
export class AminoMessageStorage extends IAminoStorage<AminoMessage> {
    constructor(client: AminoClient, community: AminoCommunity, array?: any) {
        super(client, AminoMessageStorage.prototype);
        if (array !== undefined) {
            let members: AminoMember[] = community.cache.members.get();
            let threads: AminoThread[] = community.cache.threads.get();
            array.forEach(struct => {
                let member: AminoMember;
                let memberIndex: number = members.findIndex(filter => filter.id === struct.uid);
                if (memberIndex === -1) {
                    member = new AminoMember(this.client, community, struct.uid).refresh();
                    community.cache.members.push(member);
                } else {
                    member = members[memberIndex];
                }

                let thread: AminoThread;
                let threadIndex: number = threads.findIndex(filter => filter.id === struct.threadId);
                if (threadIndex === -1) {
                    thread = new AminoThread(this.client, community, struct.threadId).refresh();
                    community.cache.threads.push(thread);
                } else {
                    thread = threads[threadIndex];
                }

                this.push(
                    new AminoMessage(this.client, community)._set_object(struct, member, thread)
                )
            });
        }
    }
};

