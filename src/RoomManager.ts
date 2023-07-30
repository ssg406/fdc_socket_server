import { loggerFactory } from 'visible_logger';
import { DraftStore, DrumCorpsCaption, Events, Player } from './types';
import { allPicks } from './util/allPicks';
import io from './server';

const logger = loggerFactory({ hideLogsDuringTest: true });

/**
 * Maintains a list of active rooms and their associated members
 * and managed creating and destroying rooms as well as adding
 * and removing members
 */
class RoomManager {

    rooms: Map<string, DraftStore>;

    constructor() {
        this.rooms = new Map();
    }

    /**
     * 
     * @param tourId ID of tour associated with room
     * @param initialPlayer player object of tour admin creating the room
     * @returns boolean indiicating success of room creation
     */
    addRoom(tourId: string, initialPlayer: Player): boolean {
        if (this.rooms.get(tourId)) {
            logger.warn('Attempted to add room - room already exists', 'Room Manager');
            return false;
        }
        this.rooms.set(tourId, { tourId: tourId, clients: [], availablePicks: allPicks, turnNumber: 0 });
        logger.success(`Room ${tourId} initialized`, 'Room Manager');
        initialPlayer.socket.emit(Events.SERVER_ROOM_CREATED);
        return true;
    }

    /**
     * Removes a room from the rooms map
     * @param tourId tour ID of room to remove
     * @returns boolean indicating success of room removal
     */
    removeRoom(tourId: string): boolean {
        const room = this.rooms.get(tourId);
        if (!room) {
            logger.warn('Attempted to remove a room - room does not exist', 'Room Manager');
            return false;
        }
        io.in(tourId).disconnectSockets();
        this.rooms.delete(tourId);
        logger.success(`Removed room ${tourId}`, 'Room Manager');
        return true;
    }

    /**
     * Adds a player to an existing room
     * @param player player object to add to room
     * @param tourId tour ID associated with room
     * @returns boolean indicating success of adding player to rom
     */
    addPlayer(player: Player, tourId: string): boolean {
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
        player.socket.join(tourId);

        const joinedPlayers = room.clients.map((player) => {
            return {
                displayName: player.displayName,
                playerId: player.playerId,
                isReady: player.isReady,
            };
        });

        io.to(room.tourId).emit(Events.SERVER_UPDATE_JOINED_PLAYERS, { joinedPlayers });
        player.socket.emit(Events.SERVER_ROOM_JOINED);
        logger.success(`Added player ${player.playerId} to room ${tourId}`);
        return true;

    }

    /**
     * Removes a player from an existing room
     * @param player player object to remove from room
     * @param tourId tour ID associated with room
     * @returns boolean indicating success of removing player
     */
    removePlayer(player: Player, tourId: string): boolean {
        const room = this.rooms.get(tourId);
        if (!room) {
            logger.warn(`Attempted to remove player but room ${tourId} was not found`, 'Room Manager');
            return false;
        }
        room.clients = room.clients.filter(client => client.playerId !== player.playerId);
        this.rooms.set(tourId, room);
        player.socket.leave(tourId);
        io.to(room.tourId).emit(Events.SERVER_UPDATE_JOINED_PLAYERS, { joinedPlayers: room.clients });
        player.socket.disconnect();
        logger.success(`Removed player ${player.playerId} from room ${tourId}`, 'Room Manager');
        return true;
    }

    /**
     * Marks a given player as ready to begin draft
     * @param tourId tour ID of associated room
     * @param playerId player ID associated with player to mark as ready
     */
    markPlayerReady(tourId: string, playerId: string): void {
        if (!this.rooms.get(tourId)) throw Error('Could not mark player ready: tour not found');
        for (const player of this.rooms.get(tourId)!.clients) {
            if (player.playerId === playerId) {
                player.isReady = true;
            }
        }
    }

    /**
     * Checks the isReady property of all players in a given room
     * @param tourId tour ID associated with room to check status of
     * @returns boolean indicating if all players are ready
     */
    checkPlayersReady(tourId: string): boolean {
        if (!this.rooms.get(tourId)) throw Error('Could not check if players are ready: tour not found');
        return this.rooms.get(tourId)!.clients.every(client => client.isReady === true);
    }

    /**
     * Shuffles the order of the clients array for a given tour room
     * @param tourId tour ID associated with room to shuffle player order
     */
    shufflePlayers(tourId: string) {
        if (!this.rooms.get(tourId)) throw Error('Could not shuffle players: room does not exist');
        const players = this.rooms.get(tourId)!.clients;

        let currentIndex: number = players.length, randomIndex: number;

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [players[currentIndex], players[randomIndex]] = [players[randomIndex], players[currentIndex]];
        }

        this.rooms.get(tourId)!.clients = players;
    }

    removePick(tourId: string, pick: DrumCorpsCaption) {
        if (!this.rooms.get(tourId)) throw Error('Could not remove pick: room does not exist');
        let currentPicks = this.rooms.get(tourId)!.availablePicks;
        currentPicks = currentPicks.filter(p => p.drumCorpsCaptionId !== pick.drumCorpsCaptionId);
        this.rooms.get(tourId)!.availablePicks = currentPicks;
    }
}

const roomManager = new RoomManager();

export default roomManager;