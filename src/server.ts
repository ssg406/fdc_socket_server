import { Server, Socket } from 'socket.io';
import { createAdapter } from 'socket.io-redis-adapter';
import { createClient } from 'redis';
import { loggerFactory } from 'visible_logger';
import dotenv from 'dotenv';
import DraftMember from './Draft';
import { ClientIdentification, DraftPlayer, Events } from './types';
import { Player, getPlayer } from './util/data';

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

//const draftNamespace = io.of('/draft');

io.on('connection', (socket: Socket) => {
    logger.info('Client has connected to server', 'Server');
    socket.on(Events.CLIENT_REQUESTS_ROOM, async (data: ClientIdentification) => {
        const player = await getPlayer(data.playerId);
        const draftPlayer: DraftPlayer = { model: player, socket, isReady: false, draftComplete: false };
        const draftMember = new DraftMember(draftPlayer, data.tourId, data.action);

        if (!draftMember.init()) {
            logger.warn('Player could not connect to room', 'Controller');
            socket.disconnect();
        }
        draftMember.isReady();
        draftMember.onPlayerLineupComplete();
        draftMember.onDisconnect();
    });
});

export default io;