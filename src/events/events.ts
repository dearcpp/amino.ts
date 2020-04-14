import AminoClient, {
    AminoCommunity,
    AminoMember,
    AminoMessage,
    message_type,
    AminoThread
} from "../index"


const debug: boolean = (process.argv.includes("--events-debug") || process.argv.includes("-ed"));

import WebSocket = require("ws");
import events = require("events");

export declare type event_type = ('message');

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
            if (debug) console.log(`[SOCKET]: RESPONSE : ${message}`);
            if (struct.t === 1000) {
                if (Object.values(message_type).includes(struct.o.chatMessage.type)) {
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
            this.socket.send();
        }, 30000);

        this.socket.on("close", this.close);
    }

    /**
     * Socket connect
     */
    public connect() {
        this.socket = new WebSocket(`wss://ws2.narvii.com/?signbody=${this.client.device}%7C${new Date().getTime()}`, {
            "headers": {
                "NDCDEVICEID": this.client.device,
                "NDCAUTH": `sid=${this.client.session}`
            }
        });
    }

    /**
     * Socket disconnect
     */
    private close() {
        if (debug) console.log("[SOCKET]: CLOSE : Socket connection lost!");
        process.exit(-1);
    }
};
