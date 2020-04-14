import AminoClient, {
    request,
    IAminoStorage,
    AminoThread,
    AminoCommunity,
    IAminoBlogStorage
} from "./../../index"

/**
 * Class for working with members
 */
export class AminoMember {

    private client: AminoClient;

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

    public community: AminoCommunity;

    /**
     * Member constructor
     * @param {AminoClient} [client] client object
     * @param {AminoCommunity} [communtity] communtiy object
     * @param {string} [id?] member id
     */
    constructor(client: AminoClient, communtity: AminoCommunity, id?: string) {
        this.client = client;
        this.community = communtity;
        this.id = id;
    }

    /**
     * Method for creating a thread
     * @param {string} [initial_message] initial message for member
     */
    public create_thread(initial_message: string): AminoThread {
        let response = request("POST", `https://service.narvii.com/api/v1/x${this.community.id}/s/chat/thread`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "json": {
                "type": 0,
                "inviteeUids": [
                    this.id
                ],
                "initialMessageContent": initial_message,
                "timestamp": new Date().getTime()
            }
        });

        return new AminoThread(this.client, this.community)._set_object(response.thread, this);
    }

    /**
     * Method for getting recent member blogs
     * @param {number} [start] start position
     * @param {number} [size] number of blogs to read
     */
    public get_recent_blogs(start: number = 0, size: number = 10): IAminoBlogStorage {
        let response = request("GET", `https://service.narvii.com/api/v1/x${this.community.id}/s/blog?type=user&q=${this.id}&start=${start}&size=${size}`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });

        return new IAminoBlogStorage(this.client, this.community, response.blogList);
    }

    /**
     * Method for updating the structure, by re-requesting information from the server
     */
    public refresh(): AminoMember {
        let response = request("GET", `https://service.narvii.com/api/v1/x${this.community.id}/s/user-profile/${this.id}?action=visit`, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });

        return this._set_object(response.userProfile)
    }

    /**
     * Method for transferring json structure to a member object
     * @param {any} [object] json member structure
     */
    public _set_object(object: any): AminoMember {
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
export class IAminoMemberStorage extends IAminoStorage<AminoMember> {
    constructor(client: AminoClient, community: AminoCommunity, array?: any) {
        super(client, IAminoMemberStorage.prototype);
        if (array !== undefined) {
            let members: AminoMember[] = community.cache.members.get();
            array.forEach(struct => {
                let member_index: number = members.findIndex(filter => filter.id === struct.threadId);
                if (member_index !== -1) {
                    this.push(members[member_index]);
                    return;
                }

                let member = new AminoMember(this.client, community, struct.uid)._set_object(struct);
                this.push(member);
                members.push(member);
                community.cache.members.push(member);
            });
        }
    }

    /**
     * Call methods to update in structure objects
     */
    public refresh() {
        for (let i = 0; i < this.length; i++) {
            this[i].refresh();
        }
    }
};

