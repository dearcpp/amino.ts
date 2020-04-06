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

    public community: AminoCommunity;
    public thread: AminoThread;

    public id: string;
    public content: string;
    public createdTime: string;
    public mediaValue: string;

    public author: AminoMember;

    private client: AminoClient;

    /**
     * Message constructor
     * @param {AminoClient} [client] client object
     * @param {AminoCommunity} [communtity] communtiy object
     * @param {any} [message] json message structure
     */
    constructor(client: AminoClient, community: AminoCommunity, message?: any) {
        this.client = client;
        this.community = community;
        if(message !== undefined) {
            this._set_object(message);
        }
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
                "timestamp": new Date().getTime()
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

    public member_cache: IAminoMemberStorage;
    public thread_cache: IAminoThreadStorage;

    constructor(client: AminoClient, community: AminoCommunity, array?: any) {
        super(client, AminoMessageStorage.prototype);
        if(array !== undefined) {
            this.member_cache = new IAminoMemberStorage(client, community);
            this.thread_cache = new IAminoThreadStorage(client, community);
            array.forEach(element => {
                let member: number = this.member_cache.findIndex(member => member.id === element.uid);
                let thread: number = this.thread_cache.findIndex(thread => thread.id === element.threadId);
                this.push(
                    new AminoMessage(client, community)._set_object(element,
                        member !== -1 ? this.member_cache[member] : this.member_cache[
                            this.member_cache.push(new AminoMember(client, community, element.uid).refresh())
                        ],
                        thread !== -1 ? this.thread_cache[thread] : this.thread_cache[
                            this.thread_cache.push(new AminoThread(client, community, element.threadId).refresh())
                        ]
                    )
                );
            });
        }
    }
};

