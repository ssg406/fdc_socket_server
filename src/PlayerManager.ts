import { Socket } from 'socket.io';

export type PlayerStore = { [key: string]: Socket };

class PlayerManager {
  connectedPlayers: PlayerStore;

  constructor() {
    this.connectedPlayers = {};
  }

  addPlayer(playerId: string, socket: Socket) {
    const existingSocket = this.connectedPlayers[playerId];
    if (existingSocket) return;
    this.connectedPlayers[playerId] = socket;
  }

  playerExists(playerId: string, socket: Socket): boolean {
    const existingSocket = this.connectedPlayers[playerId];
    if (!existingSocket) return false;
    return existingSocket.id === socket.id;
  }

  removePlayer(playerId: string) {
    delete this.connectedPlayers[playerId];
  }
}

const playerManager = new PlayerManager();
export default playerManager;
