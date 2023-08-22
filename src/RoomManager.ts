import { loggerFactory } from 'visible_logger';
import { DraftStore, DrumCorpsCaption, Events, Player, RoomStore } from './types';
import { allPicks } from './util/allPicks';
import io from './server';

const logger = loggerFactory({ hideLogsDuringTest: true });

const TURN_TIME = 45000

/**
 * Maintains a list of active rooms and their associated members
 * and managed creating and destroying rooms as well as adding
 * and removing members
 */
class RoomManager {

    rooms: RoomStore;

    constructor() {
        this.rooms = {};
    }

    /**
     * 
     * @param tourId ID of tour associated with room
     * @param initialPlayer player object of tour admin creating the room
     * @returns boolean indiicating success of room creation
     */
    addRoom(tourId: string, initialPlayer: Player): boolean {
        if (this.rooms[tourId]) {
            logger.warn('Attempted to add room - room already exists', 'Room Manager');
            return false;
        }
        this.rooms[tourId] = { tourId: tourId, clients: [], availablePicks: allPicks, turnNumber: 0 };
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
        const room = this.rooms[tourId];
        if (!room) {
            logger.warn('Attempted to remove a room - room does not exist', 'Room Manager');
            return false;
        }
        io.in(tourId).disconnectSockets();
        delete this.rooms[tourId];
        logger.success(`Removed room`, tourId);
        return true;
    }

    /**
     * Adds a player to an existing room
     * @param player player object to add to room
     * @param tourId tour ID associated with room
     * @returns boolean indicating success of adding player to rom
     */
    addPlayer(player: Player, tourId: string): boolean {
        const room = this.rooms[tourId];
        if (!room) {
            logger.warn(`Attempted to add player but room ${tourId} was not found`, 'Room Manager');
            return false;
        }

        const existingPlayer = room.clients.find(p => p.playerId === player.playerId);

        if (existingPlayer) {
            logger.warn(`Attempted to add player ${player.playerId} to room but player already exists`, tourId);
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
        logger.success(`Added player ${player.playerId}`, tourId);
        return true;

    }

    /**
     * Removes a player from an existing room
     * @param player player object to remove from room
     * @param tourId tour ID associated with room
     * @returns boolean indicating success of removing player
     */
    removePlayer(player: Player, tourId: string): boolean {
        const room = this.rooms[tourId];
        if (!room) {
            logger.warn(`Attempted to remove player but room ${tourId} was not found`, 'Room Manager');
            return false;
        }
        room.clients = room.clients.filter(client => client.playerId !== player.playerId);
        this.rooms[tourId] = room;
        player.socket.leave(tourId);
        io.to(room.tourId).emit(Events.SERVER_UPDATE_JOINED_PLAYERS, { joinedPlayers: room.clients });
        player.socket.disconnect();
        logger.success(`Removed player ${player.playerId}`, tourId);
        return true;
    }

    /**
     * Marks a given player as ready to begin draft
     * @param tourId tour ID of associated room
     * @param playerId player ID associated with player to mark as ready
     */
    markPlayerReady(tourId: string, playerId: string): void {
        if (!this.rooms[tourId]) throw Error('Could not mark player ready: tour not found');
        logger.info(`Marking player ${playerId} as ready`, tourId);
        for (const player of this.rooms[tourId].clients) {
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
        if (!this.rooms[tourId]) throw Error('Could not check if players are ready: tour not found');
        logger.info(`Checking if players are ready...`, tourId);
        return this.rooms[tourId].clients.every(client => client.isReady === true);
    }

    beginDraft(tourId: string): void {
        logger.info(`Starting draft`, tourId);
        this.shufflePlayers(tourId);
        io.to(tourId).emit(Events.SERVER_DRAFT_BEGIN);
        this.startTurn(tourId);
    }

    /**
     * Shuffles the order of the clients array for a given tour room
     * @param tourId tour ID associated with room to shuffle player order
     */
    shufflePlayers(tourId: string) {
        if (!this.rooms[tourId]) throw Error('Could not shuffle players: room does not exist');
        logger.info(`Shuffling players`, tourId);
        const players = this.rooms[tourId].clients;

        let currentIndex: number = players.length;
        let randomIndex: number;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [players[currentIndex], players[randomIndex]] = [players[randomIndex], players[currentIndex]];
        }

        this.rooms[tourId].clients = players;
    }

    /**
     * Removes a player's pick from the rooms list of available picks
     * @param tourId tour ID associated with room
     * @param pick player pick to remove from list
     */
    removePick(tourId: string, pick: DrumCorpsCaption) {
        if (!this.rooms[tourId]) throw Error('Could not remove pick: room does not exist');
        logger.info(`Removing pick ${pick} from pool`, tourId);
        let currentPicks = this.rooms[tourId].availablePicks;
        currentPicks = currentPicks.filter(p => p.drumCorpsCaptionId !== pick.drumCorpsCaptionId);
        this.rooms[tourId].availablePicks = currentPicks;
    }

    /**
     * Begins the turn by emitting the current player and available picks
     * @param tourId tour ID associated with room
     */
    startTurn(tourId: string): void {
        const draftData = this.rooms[tourId];

        logger.info(`Starting turn number ${draftData.turnNumber}`, tourId);

        io.to(tourId).emit(Events.SERVER_START_TURN, {
            currentPlayer: draftData.clients[draftData.turnNumber].playerId,
            availablePicks: draftData.availablePicks,
        });
        this._startTurnTimer(tourId);
    }

    /**
     * Sets the turn timer 
     * @param tourId tour Id associated with room
     */
    _startTurnTimer(tourId: string): void {
        this.rooms[tourId].turnTimeout = setTimeout(() => {
            this._serverEndsTurn(tourId);
        }, TURN_TIME);
    }

    /**
     * Executed when the player sends a pick before time runs out
     * @param tourId tour ID associated with room
     * @param pick DrumCorpsCaption that player chose
     */
    playerEndsTurn(tourId: string, pick: DrumCorpsCaption): void {
        clearTimeout(this.rooms[tourId].turnTimeout);
        this._processTurnResult(tourId, pick);
    }

    /**
     * Executed when time runs out and the server selects a pick
     * @param tourId tour ID associated with room
     */
    _serverEndsTurn(tourId: string): void {
        const availablePicks = this.rooms[tourId].availablePicks;
        const randomIndex = Math.floor(Math.random() * availablePicks.length);
        const randomPick = availablePicks[randomIndex];
        this._processTurnResult(tourId, randomPick);
    }

    /**
     * Finishes out the turn when either the server or the player picked
     * @param tourId tour ID associated with room
     * @param pick DrumCorpsCaption selected by server or player
     */
    _processTurnResult(tourId: string, pick: DrumCorpsCaption): void {
        this.removePick(tourId, pick);
        io.to(tourId).emit(Events.SERVER_END_TURN, {
            lastPlayerPick: pick
        });

        const currentTurnNumber = (this.rooms[tourId].turnNumber + 1) % this.rooms[tourId].clients.length;

        if (currentTurnNumber === 0) {
            this.shufflePlayers(tourId);
        }
        this.rooms[tourId].turnNumber = currentTurnNumber;

        this.startTurn(tourId);
    }

    /**
     * Marks a player as having a complete lineup. If al lineups are
     * complete, ends ther draft
     * @param tourId tour ID associated with the room
     * @param playerId ID of player whose lineup is complete
     */
    playerLineupComplete(tourId: string, playerId: string): void {
        for (const client of this.rooms[tourId].clients) {
            if (client.playerId === playerId) {
                client.draftComplete = true;
            }
        }
        const allLineupsComplete = this.rooms[tourId].clients.every(client => client.draftComplete);
        if (allLineupsComplete) {
            this._endDraft(tourId);
        }
    }

    /**
     * Emits draft over event and disconnects all sockets before
     * deleting the room
     * @param tourId tour ID associated with room
     */
    _endDraft(tourId: string) {
        io.to(tourId).emit(Events.SERVER_DRAFT_OVER);
        this.rooms[tourId].clients.forEach(client => client.socket.disconnect());
        const leftOverPicks = this.rooms[tourId].availablePicks;
        // writeData.writeRemainingPicks(tourId, leftOverPicks);
        delete this.rooms[tourId];
    }

    /**
     * Utility method used in testing
     */
    clearData() {
        Object.keys(this.rooms).forEach((tourId) => {
            clearTimeout(this.rooms[tourId].turnTimeout);
            delete this.rooms[tourId];
        });
    }
}

const roomManager = new RoomManager();

export default roomManager;