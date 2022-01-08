/**
 * Represents a client; users of polyplay should create a client to connect to a multiplayer room
 */
class Client {
    socket: WebSocket;
    // objects : GameObject[];

    /**
     * Connects to a multiplayer room
     * @param roomID The name of the room to join
     * @param clientName The name of the client joining (should be unique per room)
     * @param address The address of the websocket
     * @returns True if the connection was essential 
     */
    constructor(roomID: string, clientName: string, address: string) {
        this.socket = new WebSocket(address);
        // this.objects = [];
        this.socket.onopen = function (e) {
            console.log("Connection established");
            this.send(JSON.stringify({ roomID, clientName, type: "join" }));

            this.onmessage = function (event) {
                console.log(event.data)
                let response = JSON.parse(event.data)
                switch (response.type) {
                    // TODO: responses
                    case "update":
                        break;
                    case "create":
                        break;
                    case "join":
                        alert("JOIN EVENT ACKNOWLEDGED")
                        console.log(event.data)
                        break;
                    default:
                        throw new Error("Socket Failed to Connect");
                }
            };
        };

        this.socket.onerror = function (event) {
            console.log(`WEBSOCKET ERROR: `);
            console.log(event)
        }

        this.socket.onclose = function (event) {
            if (event.wasClean) {
                console.log(`Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.log('Connection died')
            }
        };
    }

    send_event(message : string) : void {
        this.socket.send(JSON.stringify({message, type: "input"}))
    }
}