import * as WebSocket from 'ws';

interface Client {
  getName(): string;

  copy(): Client;
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

  // takes the client creating the room, the owner
  createRoom(client: Client): void;

  // returns whether room was present (and therefore removed)
  removeRoom(roomID: number): boolean;

  getRooms(): Room[];
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
    return this.clients.map(c => c.copy());
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
  private highestRoomID: number = 0;

  createRoom(client: Client): void {
    // add a new room with only one client (as the owner)
    this.rooms.push(new RoomImpl(this.highestRoomID, [client]));
    this.highestRoomID++;
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

  getRooms(): Room[] {
    return this.rooms.map(r => r.copy());
  }

  handleConnection(ws: WebSocket): void {

    ws.on('message', (message: string) => {
      console.log('received: %s', message);
      ws.send(`Hello, you sent -> ${message}`);
    });

    ws.send('Hi there, I am a WebSocket server');
  }
}

const server: Server = new ServerImpl();

const wss = new WebSocket.Server({port: 8999});

wss.on('connection', server.handleConnection);