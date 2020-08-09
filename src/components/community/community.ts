import AminoClient, {
    request,
    IAminoCache,
    IAminoStorage,
    AminoMember,
    AminoMemberStorage,
    AminoThread,
    AminoThreadStorage,
    AminoBlogStorage,
    requestAsync
} from "./../../index"
import { APIEndpoint } from "../APIEndpoint"
export declare type blog_type = ('featured-more' | 'featured' | 'blog-all');
export declare type thread_sort = ('recommended' | 'popular' | 'latest');
export declare type thread_type = ('joined-me' | 'public-all');

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
            members: new IAminoCache<AminoMember>(25),
            threads: new IAminoCache<AminoThread>(25)
        }
        this.client = client;
        this.id = id;
    }

    /**
     * Set account nickname
     * @param {string} [nickname] string
     */
    public set_nickname(nickname: string) {
        let response = request("POST", APIEndpoint.CompileProfile(this.id,this.me.id), {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "nickname": nickname,
                "timestamp": new Date().getTime()
            })
        });
    }

    /**
     * Set account description
     * @param {string} [description] string
     */
    public async set_description(description: string) : Promise<any> {
        return await requestAsync("POST", APIEndpoint.CompileProfile(this.id,this.me.id), {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            },

            "body": JSON.stringify({
                "content": description,
                "timestamp": new Date().getTime()
            })
        });
    }

    /**
     * Method for getting the number of users online, as well as objects of the users themselves
     * @param {number} [start] pointer to the starting index to read the list
     * @param {number} [size] number of records to read
     */
    public get_online_members(start: number = 0, size: number = 10): AminoMemberStorage {
        let response = request("GET", APIEndpoint.CompileGetOnlineMembers(this.id,start,size), {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });

        return new AminoMemberStorage(this.client, this, response.userProfileList);
    }

    /**
     * Method for getting community blogs
     * @param {blog_type} [type] type of blogs
     * @param {number} [start] start position
     * @param {number} [size] number of blogs to read
     */
    public get_blogs(type: blog_type, start: number = 1, size: number = 10): AminoBlogStorage {
        
        let response = request("GET", APIEndpoint.CompileGetBlogs(this.id,type,start,size), {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });

        return new AminoBlogStorage(this.client, this, response.blogList);
    }

    /**
     * Method for getting a list of chat threads
     * @param {thread_type} [type] number of records to read
     * @param {number} [start] pointer to the starting index to read the list
     * @param {number} [size] number of records to read
     * @param {thread_sort} [sort] sorting type
     */
    public get_threads(type: thread_type, sort: thread_sort = "latest", start: number = 1, size: number = 10): AminoThreadStorage {
        let response = request("GET", APIEndpoint.CompileGetThreads(this.id,type,sort,start,size), {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session,
                "NDCDEVICEID": this.client.device
            }
        });

        return new AminoThreadStorage(this.client, this, response.threadList)
    }

    /**
     * Method for updating the structure, by re-requesting information from the server
     */
    public refresh(): AminoCommunity {
        
        let response = request("GET", APIEndpoint.CompileGetCommunity(this.id), {
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
export class AminoCommunityStorage extends IAminoStorage<AminoCommunity> {
    constructor(client: AminoClient) {
        super(client, AminoCommunityStorage.prototype);
        request("GET", APIEndpoint.JoiniedCommunities, {
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
        request("GET", APIEndpoint.JoiniedCommunities, {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        }).communityList.forEach(struct => {
            let identifier: number;
            if ((identifier = this.findIndex(filter => filter.id === struct.ndcId)) === -1) {
                this.push(new AminoCommunity(this.client, struct.ndcId).refresh());
            } else {
                this[identifier].refresh();
            }
        });
    }
};

