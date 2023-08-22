"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const socket_io_redis_adapter_1 = require("socket.io-redis-adapter");
const redis_1 = require("redis");
const visible_logger_1 = require("visible_logger");
const dotenv_1 = __importDefault(require("dotenv"));
const RoomManager_1 = __importDefault(require("./RoomManager"));
const logger = (0, visible_logger_1.loggerFactory)({ hideLogsDuringTest: true });
dotenv_1.default.config();
const io = new socket_io_1.Server({
    transports: ['websocket']
});
const pubClient = (0, redis_1.createClient)({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
const subClient = pubClient.duplicate();
try {
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter((0, socket_io_redis_adapter_1.createAdapter)(pubClient, subClient));
    });
}
catch (error) {
    logger.error('Unable to create Redis adapter', error);
}
logger.info('Server initialized', 'Controller');
const draftNamespace = io.of('/draft');
const roomManager = new RoomManager_1.default(io);
draftNamespace.on('connection', (socket) => {
    const tourId = socket.handshake.query['tourId'];
    const playerId = socket.handshake.query['playerId'];
    const isCreatingRoom = socket.handshake.query['isCreatingRoom'].toLowerCase() == 'true';
    // Create room in room manager if creating, send error on room manager error.
});
exports.default = io;
