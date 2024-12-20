import { loggerFactory } from 'visible_logger';
import { DraftPlayer, Events, PickMessage } from './types';

import roomManager from './RoomManager';
import io from './server';

const logger = loggerFactory({ hideLogsDuringTest: true });

class DraftMember {
  player: DraftPlayer;
  tourId: string;
  action: string;

  constructor(player: DraftPlayer, tourId: string, action: string) {
    this.player = player;
    this.tourId = tourId;
    this.action = action;
  }

  init(): boolean {
    if (this.action === 'create') {
      if (!roomManager.addRoom(this.tourId, this.player)) {
        logger.warn('Could not initialize room', 'Draft');
        this.player.socket.emit(Events.SERVER_ERROR, {
          errorMessage:
            'Unable to initialize draft room on server. Try again in a few moments and contact us if this problem persists.',
        });
        return false;
      }
      if (!roomManager.addPlayer(this.player, this.tourId)) {
        logger.warn('Could not join player to room', 'Draft');
        this.player.socket.emit(Events.SERVER_ERROR, {
          errorMessage:
            'Unable to join room. Attempt to start the draft again and contact us if this problem persists.',
        });
        return false;
      }
      return true;
    }

    if (this.action === 'join') {
      if (!roomManager.addPlayer(this.player, this.tourId)) {
        logger.warn('Could not join room', 'Draft');
        this.player.socket.emit(Events.SERVER_ERROR, {
          errorMessage:
            "Unable to join draft. The tour owner may not have initialized this tour's draft on the server yet.",
        });
        return false;
      }
      return true;
    }
    return false;
  }

  isReady(): void {
    this.player.socket.on(Events.CLIENT_READY_FOR_DRAFT, () => {
      roomManager.markPlayerReady(this.tourId, this.player.model.id);
      this.playerEndsTurn();
      if (roomManager.checkPlayersReady(this.tourId)) {
        io.to(this.tourId).emit(Events.SERVER_ALL_PLAYERS_READY);
      }
    });
  }

  ownerStartsDraft(): void {
    this.player.socket.on(Events.CLIENT_OWNER_BEGIN_DRAFT, () => {
      roomManager.beginDraft(this.tourId);
    });
  }

  ownerCancelsDraft(): void {
    this.player.socket.on(Events.CLIENT_OWNER_CANCEL_DRAFT, () => {
      roomManager.cancelDraft(this.tourId);
    });
  }

  onDisconnect(): void {
    this.player.socket.on('disconnect', () => {
      logger.info(
        `Socket is disconnecting for player ${this.player.model.id}`,
        'DraftMember'
      );

      // If the room no longer exists, no need to remove player
      if (!roomManager.rooms[this.tourId]) return;

      // Check if draft is in progress and call appropriate room manager method
      if (roomManager.rooms[this.tourId]?.draftInProgress) {
        roomManager.removeActivePlayer(this.player, this.tourId);
      } else {
        roomManager.removePlayer(this.player, this.tourId);
      }
    });
  }

  playerEndsTurn(): void {
    this.player.socket.on(
      Events.CLIENT_PLAYER_ENDS_TURN,
      (data: PickMessage) => {
        roomManager.playerEndsTurn(this.tourId, data.pick);
      }
    );
  }

  playerMissedTurn(): void {
    this.player.socket.on(
      Events.CLIENT_SENDS_AUTO_PICK,
      (data: PickMessage) => {
        roomManager.getClientAutoPick(this.tourId, data.pick);
      }
    );
  }

  onPlayerLineupComplete(): void {
    this.player.socket.on(Events.CLIENT_LINEUP_COMPLETE, () => {
      roomManager.playerLineupComplete(this.tourId, this.player.model.id);
    });
  }

  onClientLeaveRoom(): void {
    this.player.socket.on(Events.CLIENT_LEAVE_ROOM, () => {
      logger.info('Client has requested to leave room', 'PlayerObj');
      const room = roomManager.rooms[this.tourId];

      if (!room) return;

      if (roomManager.rooms[this.tourId].draftInProgress) {
        roomManager.removeActivePlayer(this.player, this.tourId);
      } else {
        roomManager.removePlayer(this.player, this.tourId);
      }
    });
  }
}

export default DraftMember;
