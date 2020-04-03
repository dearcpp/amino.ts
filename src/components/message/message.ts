import IAminoClient, {
    request,
    IAminoStorage,
    IAminoMember,
    IAminoThread,
    IAminoCommunity
} from "./../../index"

/**
* Class for working with messages
*/
export class IAminoMessage {

    public community: IAminoCommunity;
    public thread: IAminoThread;

    public id: string;
    public content: string;
    public createdTime: string;
    public mediaValue: string;

    public author: IAminoMember;

    private client: IAminoClient;
    constructor(client: IAminoClient, community: IAminoCommunity, message: any) {
        this.client = client;
        this.community = community;
        this._set_object(message);
    }

    /**
    * Method for calling the reply message procedure
    * @param {string} [content] text to be sent
    */
    public reply(content: string) {
        let response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.community}/s/chat/thread/${this.thread}/message`, {
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

        return new IAminoMessage(this.client, response.message, this.community);
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
    public _set_object(object: any): IAminoMessage {
        this.thread = new IAminoThread(this.client, this.community, object.threadId).refresh();

        this.id = object.messageId;
        this.content = object.content;
        this.createdTime = object.createdTime
        this.mediaValue = object.mediaValue;

        this.author = new IAminoMember(this.client, this.community, object.author.uid).refresh();

        return this;
    }
};

/**
* Class for storing messages objects
*/
export class IAminoMessageStorage extends IAminoStorage<IAminoMessage> {
    constructor(client: IAminoClient, community: IAminoCommunity, array?: any) {
        super(client, IAminoMessageStorage.prototype);
        array.forEach(element => {
            this.push(new IAminoMessage(client, community, element));
        });
    }
};

