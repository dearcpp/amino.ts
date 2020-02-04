import IAminoClient, {
    request,
    IAminoStorage,
    IAminoMember
} from './../../index'

/**
* Class for working with messages
*/
export class IAminoMessage {

    private community: number;
    private thread: string;

    public id: string;
    public content: string;
    public createdTime: string;
    public mediaValue: string;

    public author: IAminoMember;

    private client: IAminoClient;
    constructor(client: IAminoClient, message: any, community: number) {
        this.client = client;
        this.community = community;
        this.author = new IAminoMember(this.client, this.community);
        this._set_object(message);
    }

    /**
    * Method for calling the delete message procedure
    */
    public delete(): void {
        let response = JSON.parse(request("DELETE", `https://service.narvii.com/api/v1/x${this.community}/s/chat/thread/${this.thread}/message/${this.id}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session_token
            }
        }).getBody("utf8"));
    }

    /**
    * Method for transferring json structure to a message object
    * @param {any} [object] json message structure
    */
    public _set_object(object: any): IAminoMessage {
        this.thread = object.threadId;

        this.id = object.messageId;
        this.content = object.content;
        this.createdTime = object.createdTime
        this.mediaValue = object.mediaValue;

        this.author.id = object.author.uid;
        this.author.refresh();

        return this;
    }
};

/**
* Class for storing messages objects
*/
export class IAminoMessageStorage extends IAminoStorage<IAminoMessage> {
    constructor(client: IAminoClient, array?: any) {
        super(client, IAminoMessageStorage.prototype);
        array.forEach(element => {
            this.push(new IAminoMessage(client, element, element.author.ndcId));
        });
    }
};

