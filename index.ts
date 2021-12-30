import * as WebSocket from 'ws';

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
  handleConnection(ws: WebSocket): void;

  createRoom(roomID: number, owner: Client): void;

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

  constructor(id: number, clients: Client[]) {
    this.id = id;
    this.clients = clients;
    // copy to new array
    this.clients = this.getClients();
  }

  addClient(client: Client): void {
    if (this.clients.map(c => c.getName()).includes(client.getName())) {
      throw new Error("Client's name is already in use in this room.");
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
    if (clientsWithout == []) {
      throw new Error("Cannot have a room with no clients in it. Stop operation or remove room.");
    } else {
      this.clients = clientsWithout;
    }
    return contains;
  }

  copy(): Room {
    return new RoomImpl(this.id, this.clients);
  }
}

class ServerImpl implements Server {
  private rooms: Room[] = [];
  private highestClientID: number = 0;
  private readonly ws: WebSocket.Server;

  constructor(ws: WebSocket.Server) {
    this.ws = ws;
  }

  createRoom(roomID: number, client: Client): void {
    // add a new room with only one client (as the owner)
    this.rooms.push(new RoomImpl(roomID, [client]));
  }

  removeRoom(roomID: number): boolean {
    const contains: boolean = this.rooms.map(r => r.getID()).includes(roomID);
    const roomsWithout: Room[] = this.rooms.filter(r => r.getID() !== roomID);
    if (roomsWithout == []) {
      throw new Error("Cannot have a room with no clients in it. Stop operation or remove room.");
    } else {
      this.rooms = roomsWithout;
    }
    return contains;
  }

  getRoom(id: number): Room | undefined {
    return this.rooms.filter(r => r.getID() == id).pop();
  }

  getRooms(): Room[] {
    return this.rooms.map(r => r.copy());
  }

  handleConnection(ws: WebSocket): void {
    ws.on("message", this.handleMessage);
  }

  private handleMessage(message: string) {
    const messageJSON: any = JSON.parse(message);

    switch (messageJSON.type) {
      case "join":
        this.handleJoinMessage(messageJSON);
        break;
    }
  }

  private handleJoinMessage(messageJSON: any) {
    if (!(messageJSON.roomID && messageJSON.clientName)) {
      throw new Error(`Invalid message: "${messageJSON}"`);
    }
    const joinedRoom: Room | undefined = this.getRoom(messageJSON.roomID);
    const client: Client = new ClientImpl(this.highestClientID, messageJSON.clientName);

    console.log(this.ws.clients);
    if (joinedRoom) {
      joinedRoom.addClient(client);
    } else {
      this.createRoom(messageJSON.roomID, client);
    }
    this.highestClientID++;
  }
}

const wss = new WebSocket.Server({port: 8999});

const server: Server = new ServerImpl(wss);

wss.on('connection', server.handleConnection);