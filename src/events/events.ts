import AminoClient, {
    request,
    events,
    AminoCommunity,
    IAminoCommunityStorage,
    IAminoStorage,
    AminoMember,
    AminoMessageStorage,
    AminoMessage,
    IAminoThreadStorage,
    AminoThread,
} from "../index"

const WebSocket = require("ws")

export default class EventHandler {

    public socket: any;
    public emitter: events.EventEmitter;

    private client: AminoClient;
    constructor(client: AminoClient, emitter: events.EventEmitter) {
        this.client = client;
        this.emitter = emitter;

        this.socket = new WebSocket(`wss://ws1.narvii.com/?signbody=${client.device}%7C${new Date().getTime()}`, {
            "headers": {
                "NDCDEVICEID": client.device,
                "NDCAUTH": "sid=" + client.session
            }
        });

        this.socket.on("error", function(error) {
            console.log(error);
        });

        setInterval(() => {
            this.socket.send(JSON.stringify({ "ping_interval" : 60 }));
        }, 60000);

        this.socket.on("message", function(message) {
            let struct = JSON.parse(message);
            if(struct.t === 1000) {
                if(struct.o.chatMessage.type === 0) {
                    emitter.emit("message", new AminoMessage(client, client.communities.find(community => community.id = struct.o.ndcId), struct.o.chatMessage))
                }
            }
        });
    }
};
