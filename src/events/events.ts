import AminoClient, {
    AminoCommunity,
    AminoMember,
    AminoMessage,
    message_type,
    AminoThread
} from "../index"

const _debug: boolean = (process.argv.includes("--events-debug") || process.argv.includes("-ed"));

import Events = require("events");
import WebSocket = require("ws");

export declare type event_type = ('message');

export default class EventHandler extends Events.EventEmitter {

    public client: AminoClient;
    public socket: WebSocket;

    constructor(client: AminoClient) {
        super();
        this.client = client;
        this.socket = new WebSocket(
            `wss://ws1.narvii.com/?signbody=${this.client.device}%7C${new Date().getTime()}`, {
            "headers": {
                "NDCDEVICEID": this.client.device,
                "NDCAUTH": `sid=${this.client.session}`
            }
        });
        this.set_callbacks();
    }

    public set_callbacks() {
        let ref_client: AminoClient = this.client;
        this.socket.on("open", () => {
            if (_debug) { console.log("[SOCKET]: OPEN : Socket was connected!"); }
        });

        this.socket.on("error", (error: any) => {
            if (_debug) { console.log(`[SOCKET]: ERROR : ${error}`); }
            process.exit(-1);
        });

        var that = this;
        this.socket.on("close", () => {
            if (_debug) { console.log(`[SOCKET]: CLOSE : Connection was closed!`); }
            that.reconnect();
        });

        this.socket.on("message", (message: string) => {
            let struct: any = JSON.parse(message);
            if (_debug) { console.log(`[SOCKET]: RESPONSE : ${message}`); }
            switch (struct.t) {
                case (1000): {
                    if (Object.values(message_type).includes(struct.o.chatMessage.type)) {
                        let community: AminoCommunity = ref_client.communities.find(filter => filter.id = struct.o.ndcId);

                        let members: AminoMember[] = community.cache.members.get();
                        let threads: AminoThread[] = community.cache.threads.get();

                        let thread_index: number = threads.findIndex(filter => filter.id === struct.o.chatMessage.threadId);
                        let thread: AminoThread;
                        if (thread_index !== -1) {
                            thread = threads[thread_index];
                        } else {
                            thread = new AminoThread(ref_client, community, struct.o.chatMessage.threadId).refresh();
                            community.cache.threads.push(thread);
                        }

                        let member_index: number = members.findIndex(filter => filter.id === struct.o.chatMessage.author.uid);
                        let member: AminoMember;
                        if (member_index !== -1) {
                            member = members[member_index];
                        } else {
                            member = new AminoMember(ref_client, community, struct.o.chatMessage.author.uid).refresh();
                            community.cache.members.push(member);
                        }

                        this.emit("message",
                            new AminoMessage(ref_client, community)._set_object(struct.o.chatMessage, thread, member)
                        );
                    }
                    break;
                }
            }
        });
    }

    public reconnect() {
        this.socket.removeAllListeners();
        this.socket = new WebSocket(
            `wss://ws1.narvii.com/?signbody=${this.client.device}%7C${new Date().getTime()}`, {
            "headers": {
                "NDCDEVICEID": this.client.device,
                "NDCAUTH": `sid=${this.client.session}`
            }
        });
        this.set_callbacks();
    }

};
