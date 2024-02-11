"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const visible_logger_1 = require("visible_logger");
const dotenv_1 = __importDefault(require("dotenv"));
const Draft_1 = __importDefault(require("./Draft"));
const data_1 = require("./util/data");
const PlayerManager_1 = __importDefault(require("./PlayerManager"));
const types_1 = require("./types");
const logger = (0, visible_logger_1.loggerFactory)({ hideLogsDuringTest: true });
dotenv_1.default.config();
const io = new socket_io_1.Server({
    transports: ['websocket'],
});
logger.info('Server initialized', 'Controller');
io.on('connection', (socket) => {
    logger.info('Client has connected to server', 'Server');
    socket.on(types_1.Events.CLIENT_REQUESTS_ROOM, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const player = yield (0, data_1.getPlayer)(data.playerId);
        const draftPlayer = {
            model: player,
            socket,
            isReady: false,
            draftComplete: false,
        };
        const draftMember = new Draft_1.default(draftPlayer, data.tourId, data.action);
        draftMember.init();
        // Check if player has already connected and created draftMember
        if (PlayerManager_1.default.playerExists(data.playerId, socket))
            return;
        logger.info('Setting listeners for new draft member', 'Controller');
        draftMember.isReady();
        draftMember.onPlayerLineupComplete();
        draftMember.onDisconnect();
        draftMember.onClientLeaveRoom();
        draftMember.ownerStartsDraft();
        draftMember.ownerCancelsDraft();
        PlayerManager_1.default.addPlayer(data.playerId, socket);
    }));
});
exports.default = io;
