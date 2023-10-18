"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PlayerManager {
    constructor() {
        this.connectedPlayers = {};
    }
    addPlayer(playerId, socket) {
        const existingSocket = this.connectedPlayers[playerId];
        if (existingSocket)
            return;
        this.connectedPlayers[playerId] = socket;
    }
    playerExists(playerId, socket) {
        const existingSocket = this.connectedPlayers[playerId];
        if (!existingSocket)
            return false;
        return existingSocket.id === socket.id;
    }
    removePlayer(playerId) {
        delete this.connectedPlayers[playerId];
    }
}
const playerManager = new PlayerManager();
exports.default = playerManager;
