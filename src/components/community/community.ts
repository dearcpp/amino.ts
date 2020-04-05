import AminoClient, {
    request,
    IAminoStorage,
    AminoMember,
    IAminoMemberStorage,
    AminoThread,
    IAminoThreadStorage
} from "./../../index"

/**
* Class for working with communities
*/
export class AminoCommunity {

    public id: number;

    public icon: string;
    public name: string;
    public tagline: string;
    public description: string;
    public members_count: string;

    public me: AminoMember;
    public creator: AminoMember;

    public invite: string;
    public created_time: string;
    public modified_time: string;

    public keywords: string;

    private client: AminoClient;
    constructor(client: AminoClient, id: number) {
        this.client = client;
        this.id = id;
    }

    /**
    * Method for getting the number of users online, as well as objects of the users themselves
    * @param {number} [start] pointer to the starting index to read the list
    * @param {number} [size] number of records to read
    */
    public get_online_members(start: number = 0, size: number = 10): { count: number, members: IAminoMemberStorage  } {
        let response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.id}/s/live-layer?topic=ndtopic%3Ax${this.id}%3Aonline-members&start=${start}&size=${size}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8"));
        return { count: response.userProfileCount, members: new IAminoMemberStorage(this.client, response.userProfileList) };
    }

    /**
    * Method for getting a list of chat threads
    * @param {number} [start] pointer to the starting index to read the list
    * @param {number} [size] number of records to read
    */
    public get_threads(start: number = 0, size: number = 10): IAminoThreadStorage {
        let response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.id}/s/chat/thread?type=joined-me&start=${start}&size=${size}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8"));

        return new IAminoThreadStorage(this.client, this, response.threadList)
    }

    /**
    * Method for creating a threads
    * @param {AminoMember} [member] member object
    * @param {string} [initial_message] initial message for member
    */
   public create_thread(member: AminoMember, initial_message: string): AminoThread {
    let response = JSON.parse(request("POST", `https://service.narvii.com/api/v1/x${this.id}/s/chat/thread`, {
        "headers": {
            "NDCAUTH": "sid=" + this.client.session
        },

        "json": {
            "type": 0,
            "inviteeUids":[
                member.id
            ],
            "initialMessageContent": initial_message,
	        "timestamp": new Date().getTime()
        }
    }).getBody("utf8"));

    return new AminoThread(this.client, this)._set_object(response.thread, this.me);
}

    /**
    * Updating the structure, by re-requesting information from the server
    */
    public refresh(): AminoCommunity {
        let response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/g/s-x${this.id}/community/info`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8"));

        return this._set_object(response);
    }

    /**
    * Method for transferring json structure to a community object
    * @param {any} [object] json community structure
    */
    public _set_object(object: any, me?: AminoMember, creator?: AminoMember): AminoCommunity {
        this.icon = object.community.icon;
        this.name = object.community.name;
        this.tagline = object.community.tagline;
        this.description = object.community.content;
        this.members_count = object.community.membersCount;

        this.me = me !== undefined ? me : new AminoMember(this.client, this, object.currentUserInfo.userProfile.uid).refresh();
        this.creator = creator !== undefined ? creator : new AminoMember(this.client, this, object.community.agent.uid).refresh();

        this.invite = object.community.link;
        this.created_time = object.community.createdTime;
        this.created_time = object.community.modifiedTime;

        this.keywords = object.community.keywords;

        return this;
    }
};

/**
* Class for storing community objects
*/
export class IAminoCommunityStorage extends IAminoStorage<AminoCommunity> {
    constructor(client: AminoClient) {
        super(client, IAminoCommunityStorage.prototype);
        JSON.parse(request("GET", `https://service.narvii.com/api/v1/g/s/community/joined`, {
            "headers": {
                "NDCAUTH": "sid=" + client.session
            }
        }).getBody("utf8")).communityList.forEach(element => {
            this.push(
                new AminoCommunity(client, element.ndcId).refresh()
            );
        });
    }
};

