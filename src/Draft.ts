import { loggerFactory } from 'visible_logger';
import { DraftStore, Player, RoomOptions, Events, DrumCorpsCaption } from './types';
import { Namespace, Socket } from 'socket.io';
import { Adapter } from 'socket.io-adapter';
import roomManager from './RoomManager';
import io from './server';

const logger = loggerFactory({ hideLogsDuringTest: true });

class Draft {

    player: Player;
    tourId: string;
    action: string;
    lineup: DrumCorpsCaption[];

    constructor(options: RoomOptions) {
        this.player = options.player;
        this.tourId = options.tourId;
        this.action = options.action;
        this.lineup = [];
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
        }
        return false;
    }

    isReady(): void {
        this.player.socket.on(Events.CLIENT_READY_FOR_DRAFT, () => {
            roomManager.markPlayerReady(this.tourId, this.player.playerId);
            if (roomManager.checkPlayersReady(this.tourId)) {
                this.beginDraft();
            }
        });
    }

    beginDraft(): void {

    }

    onDisconnect(): void {

    }

    endTurn(): void {
        this.player.socket.on(Events.CLIENT_PLAYER_ENDS_TURN, (pick: DrumCorpsCaption | undefined) => {
            if (pick) {
                this.lineup.push(pick);
                roomManager.removePick(this.tourId, pick);
            }
        })
    }

    private _resetTimeout(): void {

    }

    private _nextTurn(): void {

    }

}

export default Draft;