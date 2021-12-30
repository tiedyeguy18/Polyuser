/**
 * Represents a client; users of polyplay should create a client to connect to a multiplayer room
 */
class Client {
    socket: WebSocket;

    /**
     * Connects to a multiplayer room
     * @param room The name of the room to join
     * @param client_name The name of the client joining (should be unique per room)
     * @returns True if the connection was essential 
     */
    constructor(roomId: string, clientName: string, address: string) {
        this.socket = new WebSocket(address);
        this.socket.onopen = function (e) {
            console.log("Connection established");
            this.send(JSON.stringify({ room: roomId, client: clientName, type: "join" }));

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
                        break;
                    default:
                        throw new Error("Socket Failed to Connect");
                }
            };
        };

        this.socket.onclose = function (event) {
            if (event.wasClean) {
                console.log(`Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.log('Connection died')
            }
        };
    }
}