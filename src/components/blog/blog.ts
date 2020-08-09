import AminoClient, {
    request,
    IAminoStorage,
    AminoMember,
    AminoCommunity,
    AminoCommentStorage
} from "./../../index"
import {APIEndpoint} from "../APIEndpoint"
/**
 * Class for working with blogs
 */
export class AminoBlog {

    private client: AminoClient;

    public id: string;
    public title: string;
    public content: string;
    public view_count: number;
    public votes_count: number;
    public comments_count: number;

    public media_list: Array<string>;

    public author: AminoMember;

    public community: AminoCommunity;

    /**
     * Blog constructor
     * @param {AminoClient} [client] client object
     * @param {AminoCommunity} [community] community object
     * @param {string} [id] blog id
     */
    constructor(client: AminoClient, community: AminoCommunity, id?: string) {
        this.client = client;
        this.community = community;
        this.id = id;
    }

    /**
     * Method for getting blog comments
     * @param {number} [start] start position
     * @param {number} [size] count by start
     */
    public get_comments(start: number = 1, size: number = 10): AminoCommentStorage {
        
        let response = request("GET", APIEndpoint.CompileGetComents(this.id,this.community.id,start,size), {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });

        return new AminoCommentStorage(this.client, this.community, this, response.commentList);
    }

    /**
     * Method for updating the structure, by re-requesting information from the server
     */
    public refresh(): AminoBlog {
        let response = request("GET", APIEndpoint.CompileGetBlog(this.id,this.community.id), {
            "headers": {
                "NDCAUTH": "sid=" + this.client.session
            }
        });

        return this._set_object(response.blog);
    }

    /**
     * Method for transferring json structure to a blog object
     * @param {any} [object] json community structure
     * @param {AminoMember} [author] blog author object
     */
    public _set_object(object: any, author?: AminoMember): AminoBlog {
        this.id = object.blogId;
        this.title = object.title;
        this.content = object.content;
        this.view_count = object.viewCount;
        this.votes_count = object.votesCount;
        this.comments_count = object.commentsCount;

        this.author = author !== undefined ? author : new AminoMember(this.client, this.community, object.author.uid).refresh();

        if (object.mediaList !== null) {
            this.media_list = new Array<string>();
            object.mediaList.forEach(struct => {
                this.media_list.push(struct[1]);
            });
        }

        return this;
    }
};

/**
 * Class for storing blog objects
 */
export class AminoBlogStorage extends IAminoStorage<AminoBlog> {
    constructor(client: AminoClient, community: AminoCommunity, array?: any) {
        super(client, AminoBlogStorage.prototype);
        if (array) {
            let members: AminoMember[] = community.cache.members.get();
            array.forEach(struct => {
                let member_index: number = members.findIndex(filter => filter.id === struct.author.uid);
                let member: AminoMember;
                if (member_index !== -1) {
                    member = members[member_index];
                } else {
                    member = new AminoMember(this.client, community, struct.author.uid).refresh();
                    community.cache.members.push(member);
                    members.push(member);
                }

                this.push(
                    new AminoBlog(this.client, community, struct.blogId)._set_object(struct, member)
                );
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

