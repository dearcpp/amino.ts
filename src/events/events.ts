import IAminoClient, {
    request,
    events,
    IAminoCommunity,
    IAminoCommunityStorage,
    IAminoStorage,
    IAminoMember,
    IAminoMessageStorage,
    IAminoMessage,
    IAminoThreadStorage,
    IAminoThread,
} from "../index"

const WebSocket = require("ws")

export class IAminoEvent {

};

function io() {

}

export class IAminoEventHandler {

    public socket: any;
    public emitter: events.EventEmitter;

    private client: IAminoClient;
    constructor(client: IAminoClient, emitter: events.EventEmitter) {
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

        this.socket.on("message", function(message) {
            let struct = JSON.parse(message);
            if(struct.t === 1000) {
                emitter.emit("message", new IAminoMessage(client, new IAminoCommunity(client, struct.o.ndcId).refresh(), struct.o.chatMessage))
            }
        });
    }
};
