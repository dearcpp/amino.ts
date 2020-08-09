import { blog_type, thread_type, thread_sort } from "../components/community/community"
/*
*Static object that can build endpoint
*/
export class APIEndpoint {
    //[prefix]
    static Prefix: string = "http://service.narvii.com/api/v1";
    // [auth]
    static Login: string = APIEndpoint.Prefix + "/g/s/auth/login";
    static JoiniedCommunities: string = APIEndpoint.Prefix + `/g/s/community/joined`


    // [COMPLILE ENDPOINTS]
    static CompileGetBlog(blogId: string, communityId: number): string {
        return APIEndpoint.Prefix + `/x${communityId}/s/blog/${blogId}`;
    }
    static CompileGetComent(comentId: string, blogId: string): string {
        return APIEndpoint.Prefix + `/x${comentId}/s/blog/${blogId}/comment/${comentId}`;
    }
    static CompileGetComents(comentId: string, communityId: number, start: number, size: number): string {
        return APIEndpoint.CompileGetBlog(comentId, communityId) + `/comment?start=${start}&size=${size}`;
    }

    static CompileProfile(id: number, userId: string): string {
        return APIEndpoint.Prefix + `/x${id}/s/user-profile/${userId}`;
    }
    static CompileGetOnlineMembers(communityId: number, start: number, size: number): string {
        return APIEndpoint.Prefix + `/x${communityId}/s/live-layer?topic=ndtopic%3Ax${communityId}%3Aonline-members&start=${start}&size=${size}`;
    }
    static CompileGetBlogs(communityId: number, type: blog_type, start: number, size: number): string {
        return APIEndpoint.Prefix + `/x${communityId}/s/feed/${type}?start=${start}&size=${size}`;
    }
    static CompileGetThreads(communityId: number, type: thread_type, sort: thread_sort, start: number, size: number): string {
        return APIEndpoint.Prefix + `/x${communityId}/s/chat/thread?type=${type}&filterType=${sort}&start=${start}&size=${size}`;
    }
    static CompileGetCommunity(communityId: number): string {
        return APIEndpoint.Prefix + `/g/s-x${communityId}/community/info`;
    }
    static CompileCreateThread(communityId: number): string {
        return APIEndpoint.Prefix + `/x${communityId}/s/chat/thread`;
    }
    static CompileGetRecentBlogs(id: string, communityId: number, start: number, size: number): string {
        return APIEndpoint.Prefix + `/x${communityId}/s/blog?type=user&q=${id}&start=${start}&size=${size}`;
    }
    static CompileGetMember(id: string, communityId: number): string {
        return APIEndpoint.Prefix + `/x${communityId}/s/user-profile/${id}?action=visit`;
    }
    static CompileMessageWithId(messageId: string, threadId: any, communityId: number): string {
        return APIEndpoint.CompileMessage(threadId, communityId) + `/${messageId}`;
    }
    static CompileMessage(threadId: any, communityId: number): string {
        return APIEndpoint.Prefix + `/x${communityId}/s/chat/thread/${threadId}/message`;
    }
    static CompileGetMessageList(threadId: any, communityId: number, count: number): string {
        return APIEndpoint.Prefix + `/x${communityId}/s/chat/thread/${threadId}/message?v=2&pagingType=t&size=${count}`;
    }
    static CompileThread(threadId: any, communityId: number): string {
        return APIEndpoint.Prefix + `/x${communityId}/s/chat/thread/${threadId}`;
    }
    static CompileThreadWithMember(threadId: any, communityId: number, memberID: string): string {
        return APIEndpoint.CompileThread(threadId, communityId) + `/member/${memberID}`;
    }
}