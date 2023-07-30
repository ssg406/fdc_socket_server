import { Server, Socket } from 'socket.io';
import { createAdapter } from 'socket.io-redis-adapter';
import { createClient } from 'redis';
import { loggerFactory } from 'visible_logger';
import dotenv from 'dotenv';
import Draft from './Draft';
import { Player, Events } from './types';

const logger = loggerFactory({ hideLogsDuringTest: true });
dotenv.config();

const io = new Server({
    transports: ['websocket']
});

const pubClient = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
const subClient = pubClient.duplicate();

try {
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
    });
} catch (error) {
    logger.error('Unable to create Redis adapter', error as Error);
}

logger.info('Server initialized', 'Controller');

const draftNamespace = io.of('/draft');

draftNamespace.on('connection', (socket: Socket) => {
    const tourId = socket.handshake.query['tourId'] as string;
    const playerId = socket.handshake.query['playerId'] as string;
    const displayName = socket.handshake.query['displayName'] as string;
    const action = socket.handshake.query['action'] as string;

    let player: Player = {
        playerId,
        displayName,
        socket,
        isReady: false
    }

    // Create draft room object for player
    const draft = new Draft({ player, tourId, action });
    if (!draft.init()) {
        logger.warn('Player could not connect to room', 'Controller');
        socket.disconnect();
    }
    draft.isReady();

});

export default io;