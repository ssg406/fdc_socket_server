"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const visible_logger_1 = require("visible_logger");
const types_1 = require("./types");
const allPicks_1 = require("./util/allPicks");
const logger = (0, visible_logger_1.loggerFactory)({ hideLogsDuringTest: true });
class RoomManager {
    constructor(io) {
        this.rooms = new Map();
        this.socketServer = io;
    }
    addRoom(tourId, initialPlayer) {
        if (this.rooms.get(tourId)) {
            logger.warn('Attempted to add room - room already exists', 'Room Manager');
            return false;
        }
        this.rooms.set(tourId, { tourId: tourId, clients: [], availablePicks: allPicks_1.allPicks, turnNumber: 0 });
        logger.success(`Room ${tourId} initialized`, 'Room Manager');
        initialPlayer.socket.emit(types_1.Events.SERVER_ROOM_CREATED);
        this.addPlayer(initialPlayer, tourId);
        return true;
    }
    removeRoom(tourId) {
        const room = this.rooms.get(tourId);
        if (!room) {
            logger.warn('Attempted to remove a room - room does not exist', 'Room Manager');
            return false;
        }
        this.socketServer.in(tourId).disconnectSockets();
        this.rooms.delete(tourId);
        logger.success(`Removed room ${tourId}`, 'Room Manager');
        return true;
    }
    addPlayer(player, tourId) {
        const room = this.rooms.get(tourId);
        if (!room) {
            logger.warn(`Attempted to add player but room ${tourId} was not found`, 'Room Manager');
            return false;
        }
        const existingPlayer = room.clients.find(p => p.playerId === player.playerId);
        if (existingPlayer) {
            logger.warn(`Attempted to add player ${player.playerId} to room ${tourId} but player already exists`, 'Room Manager');
            return false;
        }
        room.clients.push(player);
        this.socketServer.to(room.tourId).emit(types_1.Events.SERVER_UPDATE_JOINED_PLAYERS, { joinedPlayers: room.clients });
        player.socket.emit(types_1.Events.SERVER_ROOM_JOINED);
        logger.success(`Added player ${player.playerId} to room ${tourId}`);
        return true;
    }
    removePlayer(player, tourId) {
        const room = this.rooms.get(tourId);
        if (!room) {
            logger.warn(`Attempted to remove player but room ${tourId} was not found`, 'Room Manager');
            return false;
        }
        room.clients = room.clients.filter(client => client.playerId !== player.playerId);
        this.rooms.set(tourId, room);
        this.socketServer.to(room.tourId).emit(types_1.Events.SERVER_UPDATE_JOINED_PLAYERS, { joinedPlayers: room.clients });
        player.socket.disconnect();
        logger.success(`Removed player ${player.playerId} from room ${tourId}`, 'Room Manager');
        return true;
    }
}
exports.default = RoomManager;
