import IAminoClient, { 
    request, 
    IAminoStorage, 
    IAminoMember, 
    IAminoMemberStorage, 
    IAminoThreadStorage 
} from './../../index'

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
    constructor(id: number, client: IAminoClient) {
        this.id = id;
        this.client = client;
    }

    /**
    * Method for getting the number of users online, as well as objects of the users themselves
    * @param {number} [start] pointer to the starting index to read the list
    * @param {number} [size] number of records to read
    */
    public get_online_members(start: number = 0, size: number = 10): { count: number, members: IAminoMemberStorage  } {
        var response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.id}/s/live-layer?topic=ndtopic%3Ax${this.id}%3Aonline-members&start=${start}&size=${size}`, {
            "headers": {
                "NDCAUTH": 'sid=' + this.client.session_token
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
        var response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.id}/s/chat/thread?type=joined-me&start=${start}&size=${size}`, {
            "headers": {
                "NDCAUTH": 'sid=' + this.client.session_token
            }
        }).getBody("utf8"));

        return new IAminoThreadStorage(this.client, response.threadList)
    }

    /**
    * Updating the structure, by re-requesting information from the server
    */
    public refresh(): IAminoCommunity {
        var response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/g/s-x${this.id}/community/info`, {
            "headers": {
                "NDCAUTH": 'sid=' + this.client.session_token
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

        this.me = new IAminoMember(this.client, this.id, object.currentUserInfo.userProfile.uid);
        this.me.refresh();

        this.creator = new IAminoMember(this.client, this.id, object.community.agent.uid);
        this.creator.refresh();

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
                "NDCAUTH": "sid=" + this.client.session_token
            }
        }).getBody("utf8")).communityList.forEach(element => {
            var community = new IAminoCommunity(element.ndcId, this.client);
            community.refresh();
            this.push(community);
        });
    }
};

