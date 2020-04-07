import AminoClient, {
    request,
    AminoCommunity,
    IAminoCommunityStorage,
    IAminoStorage,
    AminoMember,
    AminoMessageStorage,
    AminoMessage,
    IAminoThreadStorage,
    AminoThread,
} from "../index"
import { connect } from "http2";

const WebSocket = require("ws")
const events = require("events")

/**
 * Event handler
 */
export default class EventHandler extends events.EventEmitter {

    private client: AminoClient;

    public socket: any;
    constructor(client: AminoClient) {
        super();
        this.client = client;

        this.connect()

        this.socket.on("message", (message: string) => {
            let struct = JSON.parse(message);
            if (struct.t === 1000) {
                if (struct.o.chatMessage.type === 0) {
                    let community: AminoCommunity = client.communities.find(community => community.id = struct.o.ndcId);

                    let members: AminoMember[] = community.cache.members.get();
                    let threads: AminoThread[] = community.cache.threads.get();

                    let threadIndex: number = threads.findIndex(filter => filter.id === struct.o.chatMessage.threadId);
                    let thread: AminoThread;
                    if (threadIndex === -1) {
                        thread = new AminoThread(this.client, community, struct.o.chatMessage.threadId).refresh();
                        community.cache.threads.push(thread);
                    } else {
                        thread = threads[threadIndex];
                    }

                    let memberIndex: number = members.findIndex(filter => filter.id === struct.o.chatMessage.author.uid);
                    let member: AminoMember;
                    if (memberIndex === -1) {
                        member = new AminoMember(this.client, community, struct.o.chatMessage.author.uid).refresh();
                        community.cache.members.push(member);
                    } else {
                        member = members[memberIndex];
                    }

                    this.emit("message",
                        new AminoMessage(client, community)._set_object(struct.o.chatMessage, member, thread)
                    )
                }
            }
        });

        setInterval(() => {
            this.socket.send(JSON.stringify({ "ping_interval": 60 }));
        }, 60000);

        this.socket.on("close", this.close);
    }

    public connect() {
        this.socket = new WebSocket(`wss://ws1.narvii.com/?signbody=${this.client.device}%7C${new Date().getTime()}`, {
            "headers": {
                "NDCDEVICEID": this.client.device,
                "NDCAUTH": `sid=${this.client.session}`
            }
        });
    }

    private close() {
        console.log("[amino.ts]: Socket connection lost!");
        process.exit(-1);
    }
};
