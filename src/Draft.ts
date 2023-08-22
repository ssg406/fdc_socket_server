import { loggerFactory } from 'visible_logger';
import { DraftStore, Player, RoomOptions, Events, DrumCorpsCaption } from './types';
import { Namespace, Socket } from 'socket.io';
import { Adapter } from 'socket.io-adapter';
import roomManager from './RoomManager';
import io from './server';

const logger = loggerFactory({ hideLogsDuringTest: true });

class DraftMember {

    player: Player;
    tourId: string;
    action: string;

    constructor(player: Player, tourId: string, action: string) {
        this.player = player;
        this.tourId = tourId;
        this.action = action;
    }

    init(): boolean {
        if (this.action === 'create') {
            if (!roomManager.addRoom(this.tourId, this.player)) {
                logger.warn('Could not initialize room', 'Draft');
                return false;
            }
            if (!roomManager.addPlayer(this.player, this.tourId)) {
                logger.warn('Could not join player to room', 'Draft');
                return false;
            }
            return true;
        }

        if (this.action === 'join') {
            if (!roomManager.addPlayer(this.player, this.tourId)) {
                logger.warn('Could not join room', 'Draft');
                return false;
            }
            return true;
        }
        return false;
    }



    isReady(): void {
        this.player.socket.on(Events.CLIENT_READY_FOR_DRAFT, () => {
            roomManager.markPlayerReady(this.tourId, this.player.playerId);
            this.playerEndsTurn();
            if (roomManager.checkPlayersReady(this.tourId)) {
                roomManager.beginDraft(this.tourId);
            }
        });
    }

    endDraft(): void {
        roomManager._endDraft(this.tourId);
    }

    onDisconnect(): void {

    }

    playerEndsTurn(): void {
        this.player.socket.on(Events.CLIENT_PLAYER_ENDS_TURN, (pick: DrumCorpsCaption | undefined) => {
            if (pick) {
                roomManager.playerEndsTurn(this.tourId, pick);
            }
        });
    }

    onPlayerLineupComplete(): void {
        this.player.socket.on(Events.CLIENT_LINEUP_COMPLETE, () => {
            roomManager.playerLineupComplete(this.tourId, this.player.playerId);
        });

    }

}

export default DraftMember;