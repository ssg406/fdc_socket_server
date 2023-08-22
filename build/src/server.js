"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const socket_io_redis_adapter_1 = require("socket.io-redis-adapter");
const redis_1 = require("redis");
const visible_logger_1 = __importDefault(require("visible_logger"));
const dotenv_1 = __importDefault(require("dotenv"));
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
    visible_logger_1.default.error('Unable to create Redis adapter', error);
}
visible_logger_1.default.info('Server initialized', 'Controller');
const draftNamespace = io.of('/draft');
draftNamespace.on('connection', (socket) => {
    const { tourId, playerId, action } = socket.handshake.query;
});
exports.default = io;
