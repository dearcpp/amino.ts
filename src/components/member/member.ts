import IAminoClient, { 
    request,
    IAminoStorage 
} from './../../index'

/**
* Class for working with members
*/
export class IAminoMember {

    private community: number;

    public id: string;
    public icon: string;
    public name: string;
    public online_status: number;
    public members_count: number;
    public reputation: number;
    public level: number;

    public created_time: string;
    public modified_time: string;

    public blogs_count: number;
    public stories_count: number;

    private client: IAminoClient;
    constructor(client: IAminoClient, communtity?: number, id?: string) {
        this.client = client;
        this.community = communtity;
        this.id = id;
    }

    /**
    * Updating the structure, by re-requesting information from the server
    */
    public refresh(): IAminoMember {
        var response = JSON.parse(request("GET", `https://service.narvii.com/api/v1/x${this.community}/s/user-profile/${this.id}?action=visit`, {
            "headers": {
                "NDCAUTH": 'sid=' + this.client.session_token
            }
        }).getBody("utf8"));

        return this._set_object(response.userProfile)
    }

    /**
    * Method for transferring json structure to a member object
    * @param {any} [object] json member structure
    */
    public _set_object(object: any): IAminoMember {
        this.id = object.uid;
        this.icon = object.icon;
        this.name = object.nickname;
        this.online_status = object.onlineStatus;
        this.members_count = object.membersCount;
        this.reputation = object.reputation;
        this.level = object.level;

        this.created_time = object.createdTime;
        this.modified_time = object.modifiedTime;

        this.blogs_count = object.blogsCount;
        this.stories_count = object.storiesCount;

        return this;
    }
};

/**
* Class for storing members objects
*/
export class IAminoMemberStorage extends IAminoStorage<IAminoMember> {   
    constructor(client: IAminoClient, array?: any) { 
        super(client, IAminoMemberStorage.prototype);
        array.forEach(element => {
            var member = new IAminoMember(client, element.ndcId, element.uid);
            member._set_object(element);
            this.push(member);
        });
    }
};

