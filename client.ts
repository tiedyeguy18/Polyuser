/**
 * Represents a client; users of polyplay should create a client to connect to a multiplayer room
 */
class Client {
    private socket: WebSocket;
    private gameObjects : GameObject[];
    private messageBuffer : JSON[];
    public currentFrame : number;

    /**
     * Connects to a multiplayer room
     * @param roomID The name of the room to join
     * @param clientName The name of the client joining (should be unique per room)
     * @param address The address of the websocket
     * @returns True if the connection was essential 
     */
    public constructor(roomID: string, clientName: string, address: string, maxCapacity : number = 0) {
        this.currentFrame = -1;
        this.socket = new WebSocket(address);
        this.gameObjects = [];
        this.messageBuffer = [];
        this.socket.onopen = (e) => {
            console.log("Connection established");
            this.socket.send(JSON.stringify({ roomID, clientName, maxCapacity, type: "join"}));

            this.socket.onmessage = (event) => {
                console.log(event.data)
                let response = JSON.parse(event.data)
                try {
                    switch (response.type) {
                        case "update":
                            this.socket.send(JSON.stringify({userInputs: this.messageBuffer}))
                            this.messageBuffer = []
                            this.gameObjects.forEach((gameObject : GameObject) => {gameObject.update()});
                            response.updatedGameObjects.array.forEach((object : any) => {
                                this.gameObjects[object.id].updateFromData(object.data);
                            });
                            break;
                        case "create":
                            response.newGameObject.array.forEach((newObject : any) => {
                                this.gameObjects[newObject.id] = Reflect.construct(newObject.typeOfObject, newObject.paramValues.array);
                            });
                            break;
                        case "join":
                            console.log('JOINT DATA')
                            console.log(event.data)
                            break;
                        case "error":
                            console.log(response.type, response.message);
                        default:
                            throw new Error("Socket Failed to Connect");
                    }
                } catch(error) {
                    console.error("MALFORMED EVENT");
                    console.error(event.data);
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

    /**
     * Send an event across to the server
     * @param message The message to send to the server code
     */
    public sendEvent(message : JSON) : void {
        this.messageBuffer.push(message)
    }

    /**
     * Get the list of all game objects that are currently active
     * @returns A list of game objects that have not been destroyed yet
     */
    public getGameObjects() : GameObject[] {
        return this.gameObjects;
    }
}