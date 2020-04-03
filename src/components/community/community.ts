import IAminoClient, {
    request,
    IAminoStorage,
    IAminoMember,
    IAminoMemberStorage,
    IAminoThreadStorage
} from "./../../index"

/**
* Class for working with communities
*/
export class IAminoCommunity {

    public id: number;

    public icon: string;
    public name: string;
    public tagline: string;
    public description: string;
    public members_count: string;

    public me: IAminoMember;
    public creator: IAminoMember;

    public invite: string;
    public created_time: string;
    public modified_time: string;

    public keywords: string;

    private client: IAminoClient;
    constructor(client: IAminoClient, id: number) {
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
    public get_chats(start: number = 0, size: number = 10): IAminoThreadStorage {
        let response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.id}/s/chat/thread?type=joined-me&start=${start}&size=${size}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8"));

        return new IAminoThreadStorage(this.client, response.threadList)
    }

    /**
    * Updating the structure, by re-requesting information from the server
    */
    public refresh(): IAminoCommunity {
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
    public _set_object(object: any): IAminoCommunity {
        this.icon = object.community.icon;
        this.name = object.community.name;
        this.tagline = object.community.tagline;
        this.description = object.community.content;
        this.members_count = object.community.membersCount;

        this.me = new IAminoMember(this.client, this, object.currentUserInfo.userProfile.uid).refresh();
        this.creator = new IAminoMember(this.client, this, object.community.agent.uid).refresh();

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
export class IAminoCommunityStorage extends IAminoStorage<IAminoCommunity> {
    constructor(client: IAminoClient) {
        super(client, IAminoCommunityStorage.prototype);
        JSON.parse(request("GET", `https://service.narvii.com/api/v1/g/s/community/joined`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).getBody("utf8")).communityList.forEach(element => {
            let community = new IAminoCommunity(this.client, element.ndcId);
            community.refresh();
            this.push(community);
        });
    }
};

