"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const visible_logger_1 = require("visible_logger");
const types_1 = require("./types");
const RoomManager_1 = __importDefault(require("./RoomManager"));
const server_1 = __importDefault(require("./server"));
const logger = (0, visible_logger_1.loggerFactory)({ hideLogsDuringTest: true });
class DraftMember {
    constructor(player, tourId, action) {
        this.player = player;
        this.tourId = tourId;
        this.action = action;
    }
    init() {
        if (this.action === 'create') {
            if (!RoomManager_1.default.addRoom(this.tourId, this.player)) {
                logger.warn('Could not initialize room', 'Draft');
                this.player.socket.emit(types_1.Events.SERVER_ERROR, {
                    errorMessage: 'Unable to initialize draft room on server. Try again in a few moments and contact us if this problem persists.',
                });
                return false;
            }
            if (!RoomManager_1.default.addPlayer(this.player, this.tourId)) {
                logger.warn('Could not join player to room', 'Draft');
                this.player.socket.emit(types_1.Events.SERVER_ERROR, {
                    errorMessage: 'Unable to join room. Attempt to start the draft again and contact us if this problem persists.',
                });
                return false;
            }
            return true;
        }
        if (this.action === 'join') {
            if (!RoomManager_1.default.addPlayer(this.player, this.tourId)) {
                logger.warn('Could not join room', 'Draft');
                this.player.socket.emit(types_1.Events.SERVER_ERROR, {
                    errorMessage: "Unable to join draft. The tour owner may not have initialized this tour's draft on the server yet.",
                });
                return false;
            }
            return true;
        }
        return false;
    }
    isReady() {
        this.player.socket.on(types_1.Events.CLIENT_READY_FOR_DRAFT, () => {
            RoomManager_1.default.markPlayerReady(this.tourId, this.player.model.id);
            this.playerEndsTurn();
            if (RoomManager_1.default.checkPlayersReady(this.tourId)) {
                server_1.default.to(this.tourId).emit(types_1.Events.SERVER_ALL_PLAYERS_READY);
            }
        });
    }
    ownerStartsDraft() {
        this.player.socket.on(types_1.Events.CLIENT_OWNER_BEGIN_DRAFT, () => {
            RoomManager_1.default.beginDraft(this.tourId);
        });
    }
    ownerCancelsDraft() {
        this.player.socket.on(types_1.Events.CLIENT_OWNER_CANCEL_DRAFT, () => {
            RoomManager_1.default.cancelDraft(this.tourId);
        });
    }
    onDisconnect() {
        this.player.socket.on('disconnect', () => {
            var _a;
            logger.info(`Socket is disconnecting for player ${this.player.model.id}`, 'DraftMember');
            // If the room no longer exists, no need to remove player
            if (!RoomManager_1.default.rooms[this.tourId])
                return;
            // Check if draft is in progress and call appropriate room manager method
            if ((_a = RoomManager_1.default.rooms[this.tourId]) === null || _a === void 0 ? void 0 : _a.draftInProgress) {
                RoomManager_1.default.removeActivePlayer(this.player, this.tourId);
            }
            else {
                RoomManager_1.default.removePlayer(this.player, this.tourId);
            }
        });
    }
    playerEndsTurn() {
        this.player.socket.on(types_1.Events.CLIENT_PLAYER_ENDS_TURN, (data) => {
            RoomManager_1.default.playerEndsTurn(this.tourId, data.pick);
        });
    }
    playerMissedTurn() {
        this.player.socket.on(types_1.Events.CLIENT_SENDS_AUTO_PICK, (data) => {
            RoomManager_1.default.getClientAutoPick(this.tourId, data.pick);
        });
    }
    onPlayerLineupComplete() {
        this.player.socket.on(types_1.Events.CLIENT_LINEUP_COMPLETE, () => {
            RoomManager_1.default.playerLineupComplete(this.tourId, this.player.model.id);
        });
    }
    onClientLeaveRoom() {
        this.player.socket.on(types_1.Events.CLIENT_LEAVE_ROOM, () => {
            logger.info('Client has requested to leave room', 'PlayerObj');
            const room = RoomManager_1.default.rooms[this.tourId];
            if (!room)
                return;
            if (RoomManager_1.default.rooms[this.tourId].draftInProgress) {
                RoomManager_1.default.removeActivePlayer(this.player, this.tourId);
            }
            else {
                RoomManager_1.default.removePlayer(this.player, this.tourId);
            }
        });
    }
}
exports.default = DraftMember;
