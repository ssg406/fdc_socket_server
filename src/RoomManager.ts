import { loggerFactory } from 'visible_logger';
import { DrumCorpsCaption, Events, DraftPlayer, RoomStore } from './types';
import { markTourDraftComplete, writeRemainingPicks } from './util/data';
import { allPicks } from './util/allPicks';
import io from './server';

const logger = loggerFactory({ hideLogsDuringTest: true });

const TURN_TIME = 45000;

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
  addRoom(tourId: string, initialPlayer: DraftPlayer): boolean {
    // If the room exists, return immediately
    if (this.rooms[tourId]) {
      logger.warn('Room already exists, keeping existing room', 'Room Manager');
      return true;
    }
    this.rooms[tourId] = {
      tourId: tourId,
      clients: [],
      availablePicks: allPicks,
      turnNumber: 0,
      draftInProgress: false,
      roundNumber: 1,
    };
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
      logger.warn(
        'Attempted to remove a room - room does not exist',
        'Room Manager'
      );
      return false;
    }
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
  addPlayer(player: DraftPlayer, tourId: string): boolean {
    const room = this.rooms[tourId];
    if (!room) {
      logger.warn(
        `Attempted to add player but room ${tourId} was not found`,
        'Room Manager'
      );
      return false;
    }

    if (room.draftInProgress) {
      logger.warn(`Player attempted to join draft already in progress`, tourId);
      return false;
    }

    const existingPlayer = room.clients.find(
      (p) => p.model.id === player.model.id
    );

    // Player is left in room if already joined
    if (existingPlayer) {
      logger.warn(`Player ${player.model.id} is already in the room`, tourId);
      return true;
    }

    room.clients.push(player);
    player.socket.join(tourId);
    player.socket.emit(Events.SERVER_ROOM_JOINED);
    logger.success(`Added player ${player.model.id}`, tourId);
    this.updateJoinedPlayers(tourId);
    return true;
  }

  /**
   * Sends a list of joined players to the room including ready status
   * @param tourId tour ID to update
   */
  updateJoinedPlayers(tourId: string) {
    const joinedPlayers = this.rooms[tourId].clients.map((player) => {
      return {
        player: player.model,
        isReady: player.isReady,
      };
    });
    io.to(tourId).emit(Events.SERVER_UPDATE_JOINED_PLAYERS, { joinedPlayers });
  }

  /**
   * Removes a player from an existing room
   * @param player player object to remove from room
   * @param tourId tour ID associated with room
   * @returns boolean indicating success of removing player
   */
  removePlayer(player: DraftPlayer, tourId: string): boolean {
    const room = this.rooms[tourId];
    if (!room) {
      logger.warn(
        `Attempted to remove player but room ${tourId} was not found`,
        'Room Manager'
      );
      return false;
    }
    room.clients = room.clients.filter(
      (client) => client.model.id !== player.model.id
    );
    if (room.clients.length === 0) {
      logger.info('Room is now empty, removing room', tourId);
      return this.removeRoom(tourId);
    }
    this.rooms[tourId] = room;
    player.socket.leave(tourId);
    this.updateJoinedPlayers(tourId);
    logger.success(`Removed player ${player.model.id}`, tourId);
    if (this.rooms[tourId].clients.length === 0) {
      logger.info('No players left, removing room', tourId);
      this.removeRoom(tourId);
    }
    return true;
  }

  /**
   * Removes a player from an active draft
   * @param player player to remove
   * @param tourId tour ID associated with room
   */
  removeActivePlayer(player: DraftPlayer, tourId: string) {
    const currentTurnNumber = this.rooms[tourId].turnNumber;
    const currentPlayer = this.rooms[tourId].clients[currentTurnNumber];

    this.rooms[tourId].clients = this.rooms[tourId].clients.filter(
      (client) => client.model.id !== player.model.id
    );

    if (currentPlayer.model.id === player.model.id) {
      // End turn
      clearTimeout(this.rooms[tourId].turnTimeout);
      // Recalculate turn number
      this.rooms[tourId].turnNumber =
        currentTurnNumber === 0 ? 0 : currentTurnNumber - 1;
      // Remove disconnected player
      this.startTurn(tourId);
    }

    io.to(tourId).emit(Events.SERVER_PLAYER_LEFT_DRAFT, {
      displayName: player.model.displayName,
    });

    // If no players remain
    if (this.rooms[tourId].clients.length === 0) {
      logger.info('No players left, removing room', tourId);
      this.removeRoom(tourId);
    }

    // Start the turn over with same or recalculated turn number
    this.startTurn(tourId);
  }

  /**
   * Marks a given player as ready to begin draft
   * @param tourId tour ID of associated room
   * @param playerId player ID associated with player to mark as ready
   */
  markPlayerReady(tourId: string, playerId: string): void {
    if (!this.rooms[tourId])
      throw Error('Could not mark player ready: tour not found');
    logger.info(`Marking player ${playerId} as ready`, tourId);
    for (const player of this.rooms[tourId].clients) {
      if (player.model.id === playerId) {
        player.isReady = true;
      }
    }
    this.updateJoinedPlayers(tourId);
  }

  /**
   * Checks the isReady property of all players in a given room
   * @param tourId tour ID associated with room to check status of
   * @returns boolean indicating if all players are ready
   */
  checkPlayersReady(tourId: string): boolean {
    if (!this.rooms[tourId])
      throw Error('Could not check if players are ready: tour not found');
    logger.info(`Checking if players are ready...`, tourId);
    return this.rooms[tourId].clients.every(
      (client) => client.isReady === true
    );
  }

  /**
   * Begins the draft
   * @param tourId tour ID associated with room
   */
  beginDraft(tourId: string): void {
    logger.info(`Starting draft`, tourId);
    // this.shufflePlayers(tourId);
    io.to(tourId).emit(Events.SERVER_DRAFT_BEGIN);
    this.rooms[tourId].draftInProgress = true;
    this.startTurn(tourId);
  }

  /**
   * Shuffles the order of the clients array for a given tour room
   * @param tourId tour ID associated with room to shuffle player order
   */
  shufflePlayers(tourId: string) {
    if (!this.rooms[tourId])
      throw Error('Could not shuffle players: room does not exist');
    logger.info(`Shuffling players`, tourId);
    const players = this.rooms[tourId].clients;

    let currentIndex: number = players.length;
    let randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [players[currentIndex], players[randomIndex]] = [
        players[randomIndex],
        players[currentIndex],
      ];
    }

    this.rooms[tourId].clients = players;
  }

  /**
   * Removes a player's pick from the rooms list of available picks
   * @param tourId tour ID associated with room
   * @param pick player pick to remove from list
   */
  removePick(tourId: string, pick: DrumCorpsCaption) {
    if (!this.rooms[tourId])
      throw Error('Could not remove pick: room does not exist');
    logger.info(
      `Removing pick ${pick.corps} ${pick.caption} from pool`,
      tourId
    );
    let currentPicks = this.rooms[tourId].availablePicks;
    currentPicks = currentPicks.filter((p) => p.id !== pick.id);
    this.rooms[tourId].availablePicks = currentPicks;
  }

  /**
   * Begins the turn by emitting the current player and available picks
   * @param tourId tour ID associated with room
   */
  startTurn(tourId: string): void {
    const draftData = this.rooms[tourId];

    const nextTurnNumber =
      (draftData.turnNumber + 1) % draftData.clients.length;

    logger.info(
      `Starting turn number ${draftData.turnNumber}, next turn number is ${nextTurnNumber}`,
      tourId
    );
    io.to(tourId).emit(Events.SERVER_START_TURN, {
      currentPlayerId: draftData.clients[draftData.turnNumber].model.id,
      currentPlayerName:
        draftData.clients[draftData.turnNumber].model.displayName,
      nextPlayerName: draftData.clients[nextTurnNumber].model.displayName,
      availablePicks: draftData.availablePicks,
      roundNumber: draftData.roundNumber,
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
    logger.info(
      `Player is ending turn, received pick ${pick.corps} ${pick.caption}`
    );
    clearTimeout(this.rooms[tourId].turnTimeout);
    this._processTurnResult(tourId, pick);
  }

  /**
   * Executed when time runs out and the server selects a pick
   * @param tourId tour ID associated with room
   */
  _serverEndsTurn(tourId: string): void {
    logger.info('Server is ending turn', tourId);
    const currentPlayer =
      this.rooms[tourId].clients[this.rooms[tourId].turnNumber];

    currentPlayer.socket.emit(Events.SERVER_CLIENT_MISSED_TURN);

    this.rooms[tourId].missedTurnTimeout = setTimeout(() => {
      logger.warn('Executing missed turn timout, no pick will process', tourId);
      this._processTurnResult(tourId);
    }, 5000);
  }

  getClientAutoPick(tourId: string, pick: DrumCorpsCaption): void {
    clearTimeout(this.rooms[tourId].missedTurnTimeout);
    this._processTurnResult(tourId, pick);
  }

  /**
   * Finishes out the turn when either the server or the player picked
   * @param tourId tour ID associated with room
   * @param pick DrumCorpsCaption selected by server or player
   */
  _processTurnResult(tourId: string, pick?: DrumCorpsCaption): void {
    logger.info(
      `Got pick, processing result: ${pick?.corps} ${pick?.caption}`,
      tourId
    );
    if (pick) {
      this.removePick(tourId, pick);
      logger.info(
        `${this.rooms[tourId].availablePicks.length} picks remaining.`
      );
    }
    io.to(tourId).emit(Events.SERVER_END_TURN, {
      lastPlayerPick: pick,
    });

    const currentTurnNumber =
      (this.rooms[tourId].turnNumber + 1) % this.rooms[tourId].clients.length;

    if (currentTurnNumber === 0) {
      //this.shufflePlayers(tourId);
      this.rooms[tourId].roundNumber++;
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
      if (client.model.id === playerId) {
        client.draftComplete = true;
      }
    }
    const allLineupsComplete = this.rooms[tourId].clients.every(
      (client) => client.draftComplete
    );
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
    this.clearTurnTimers(tourId);
    const leftOverPicks = this.rooms[tourId].availablePicks;
    writeRemainingPicks(tourId, leftOverPicks);
    markTourDraftComplete(tourId);
    delete this.rooms[tourId];
  }

  /**
   * Cancels an in progress draft
   * @param tourId tour ID associated with room
   */
  cancelDraft(tourId: string) {
    logger.info('Owner is requesting to cancel draft', tourId);
    io.to(tourId).emit(Events.SERVER_DRAFT_CANCELLED_BY_OWNER);
    this.clearTurnTimers(tourId);
    delete this.rooms[tourId];
  }

  /**
   * Clears timers associated with draft room
   * @param tourId tour ID associated with room
   */
  clearTurnTimers(tourId: string) {
    logger.info('Clearing all turn timeouts', tourId);
    const room = this.rooms[tourId];
    clearTimeout(room.turnTimeout);
    clearTimeout(room.missedTurnTimeout);
  }

  /**
   * Utility method used in testing, clears all data in rooms object
   * and ends any active timers
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
