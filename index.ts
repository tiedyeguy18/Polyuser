import * as WebSocket from 'ws';
import {IncomingMessage} from 'http';

interface Client {
  getName(): string;

  getID(): number;
}

interface Room {
  addClient(client: Client): void;

  // returns whether client was present (and therefore removed)
  removeClient(client: Client): boolean;

  getOwner(): Client;

  getClients(): Client[];

  getID(): number;

  copy(): Room;
}

interface Server {
  handleConnection(ws: WebSocket, req: IncomingMessage): void;

  createRoom(roomID: number, owner: Client, maxCapacity: number): void;

  // returns whether room was present (and therefore removed)
  removeRoom(roomID: number): boolean;

  getRoom(id: number): Room | undefined;

  getRooms(): Room[];
}

class ClientImpl implements Client {
  private readonly id: number;
  private readonly name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  getID(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }
}

class RoomImpl implements Room {
  // INVARIANT: clients is non-empty
  // INVARIANT: the owner is the first client in clients
  private readonly id: number;
  private clients: Client[];
  private readonly maxCapacity: number;

  constructor(id: number, clients: Client[], maxCapacity: number) {
    this.id = id;
    this.clients = clients;
    // copy to new array
    this.clients = this.getClients();
    this.maxCapacity = maxCapacity;
  }

  addClient(client: Client): void {
    if (this.clients.map(c => c.getName()).includes(client.getName())) {
      throw new Error("Client's name is already in use in this room.");
    }
    if (this.clients.length >= this.maxCapacity) {
      throw new Error("Room full.");
    }
    this.clients.push(client);
  }

  getClients(): Client[] {
    return this.clients.map(s => s);
  }

  getID(): number {
    return this.id;
  }

  getOwner(): Client {
    return this.clients[0];
  }

  removeClient(client: Client): boolean {
    const contains: boolean = this.clients.includes(client);
    const clientsWithout: Client[] = this.clients.filter(c => c !== client);
    if (clientsWithout === []) {
      throw new Error("Cannot have a room with no clients in it. Stop operation or remove room.");
    } else {
      this.clients = clientsWithout;
    }
    return contains;
  }

  copy(): Room {
    return new RoomImpl(this.id, this.clients, this.maxCapacity);
  }
}

class ServerImpl implements Server {
  private rooms: Room[] = [];
  private clients: Map<string, Client> = new Map<string, Client>();
  private highestClientID: number = 0;
  private readonly wss: WebSocket.Server;

  constructor(wss: WebSocket.Server) {
    this.wss = wss;
  }

  createRoom(roomID: number, client: Client, maxCapacity: number): void {
    // add a new room with only one client (as the owner)
    this.rooms.push(new RoomImpl(roomID, [client], maxCapacity));
  }

  removeRoom(roomID: number): boolean {
    const contains: boolean = this.rooms.map(r => r.getID()).includes(roomID);
    const roomsWithout: Room[] = this.rooms.filter(r => r.getID() !== roomID);
    if (roomsWithout === []) {
      throw new Error("Cannot have a room with no clients in it. Stop operation or remove room.");
    } else {
      this.rooms = roomsWithout;
    }
    return contains;
  }

  getRoom(id: number): Room | undefined {
    return this.rooms.filter(r => r.getID() === id).pop();
  }

  getRooms(): Room[] {
    return this.rooms.map(r => r.copy());
  }

  handleConnection(ws: WebSocket, req: IncomingMessage): void {
    console.log("CONNECTED");
    const clientKey: string = <string>req.headers['sec-websocket-key'];
    ws.on("message", (event) => (this.handleMessage(event, ws, clientKey)));
    ws.on("close", () => this.close(clientKey));
  }

  private handleMessage(message: WebSocket.RawData, ws: WebSocket, clientKey: string) {
    try {
      console.log(`RECEIVED ${message.toString()}`)
      const messageJSON: any = JSON.parse(message.toString());

      switch (messageJSON.type) {
        case "join":
          this.handleJoinMessage(messageJSON, clientKey);
          break;
      }
    } catch (e: unknown) {
      console.error((<Error>e).message);
      ws.send(JSON.stringify(
          {
            type: "hi Spenser",
            message: `Error: ${(<Error>e).message}`
          }
      ));
    }
  }

  private close(clientKey: string) {
    const toRemove: Client = <Client>this.clients.get(clientKey);
    this.rooms.filter(r => r.getClients().includes(toRemove))[0].removeClient(toRemove);
    this.clients.delete(clientKey);
  }

  private handleJoinMessage(messageJSON: any, clientKey: string) {
    if (!(messageJSON.roomID && messageJSON.clientName)) {
      throw new Error(`Invalid message: "${messageJSON}"`);
    }
    if (!messageJSON.maxCapacity || messageJSON.maxCapacity <= 0) {
      messageJSON.maxCapacity = Infinity;
    }
    const joinedRoom: Room | undefined = this.getRoom(messageJSON.roomID);
    const client: Client = new ClientImpl(this.highestClientID, messageJSON.clientName);

    if (joinedRoom) {
      joinedRoom.addClient(client);
    } else {
      this.createRoom(messageJSON.roomID, client, messageJSON.maxCapacity);
    }
    this.clients.set(clientKey, client);
    this.highestClientID++;
  }
}

const wss = new WebSocket.Server({port: 8999});

const server: Server = new ServerImpl(wss);

wss.on('connection', (ws, req) => server.handleConnection(ws, req));