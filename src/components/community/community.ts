import AminoClient, {
    request,
    IAminoCache,
    IAminoStorage,
    AminoMember,
    IAminoMemberStorage,
    AminoThread,
    IAminoThreadStorage,
    AminoMessage
} from "./../../index"

/**
* Class for working with communities
*/
export class AminoCommunity {

    private client: AminoClient;

    public id: number;

    public icon: string;
    public name: string;
    public tagline: string;
    public description: string;
    public members_count: string;

    public invite: string;
    public created_time: string;
    public modified_time: string;

    public keywords: string;

    public me: AminoMember;
    public creator: AminoMember;

    public cache: {
        members: IAminoCache<AminoMember>,
        threads: IAminoCache<AminoThread>
    };

    /**
    * Community constructor
    * @param {AminoClient} [client] client object
    * @param {number} [id] community id
    */
    constructor(client: AminoClient, id: number) {
        this.cache = {
            members: new IAminoCache<AminoMember>(50),
            threads: new IAminoCache<AminoThread>(50)
        }
        this.client = client;
        this.id = id;
    }

    /**
    * Method for getting the number of users online, as well as objects of the users themselves
    * @param {number} [start] pointer to the starting index to read the list
    * @param {number} [size] number of records to read
    */
    public get_online_members(start: number = 0, size: number = 10): { count: number, members: IAminoMemberStorage } {
        let response = request("GET", `https://service.narvii.com/api/v1/x${this.id}/s/live-layer?topic=ndtopic%3Ax${this.id}%3Aonline-members&start=${start}&size=${size}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });

        return { count: response.userProfileCount, members: new IAminoMemberStorage(this.client, this, response.userProfileList) };
    }

    /**
    * Method for getting a list of chat threads
    * @param {number} [start] pointer to the starting index to read the list
    * @param {number} [size] number of records to read
    */
    public get_threads(start: number = 0, size: number = 10): IAminoThreadStorage {
        let response = request("GET", `https://service.narvii.com/api/v1/x${this.id}/s/chat/thread?type=joined-me&start=${start}&size=${size}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });

        return new IAminoThreadStorage(this.client, this, response.threadList)
    }

    /**
    * Method for creating a threads
    * @param {AminoMember} [member] member object
    * @param {string} [initial_message] initial message for member
    */
    public create_thread(member: AminoMember, initial_message: string): AminoThread {
        let response = request("POST", `https://service.narvii.com/api/v1/x${this.id}/s/chat/thread`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "json": {
                "type": 0,
                "inviteeUids": [
                    member.id
                ],
                "initialMessageContent": initial_message,
                "timestamp": new Date().getTime()
            }
        });

        return new AminoThread(this.client, this)._set_object(response.thread, this.me);
    }

    /**
    * Method for updating the structure, by re-requesting information from the server
    */
    public refresh(): AminoCommunity {
        let response = request("GET", `https://service.narvii.com/api/v1/g/s-x${this.id}/community/info`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });

        return this._set_object(response);
    }

    /**
    * Method for transferring json structure to a community object
    * @param {any} [object] json community structure
    * @param {AminoMember} [me] me object
    * @param {AminoMember} [creator] creator object
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
        request("GET", `https://service.narvii.com/api/v1/g/s/community/joined`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).communityList.forEach(community => {
            this.push(new AminoCommunity(this.client, community.ndcId).refresh());
        });
    }

    /**
     * Call methods to update in structure objects
     */
    public refresh() {
        request("GET", `https://service.narvii.com/api/v1/g/s/community/joined`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).communityList.forEach(community => {
            let identifier: number;
            if ((identifier = this.findIndex(object => object.id === community.ndcId)) === -1) {
                this.push(new AminoCommunity(this.client, community.ndcId).refresh());
            } else {
                this[identifier].refresh();
            }
        });
    }
};

