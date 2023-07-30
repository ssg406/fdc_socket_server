import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { assert } from 'chai';

describe('Clients can connect to server', () => {

    let io: Server, serverSocket: Socket, clientSocket: ClientSocket;

    before((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(3000, () => {
            io.on('connection', (socket) => {
                serverSocket = socket;
            })
            clientSocket = Client('http://localhost:3000', {
                query: {
                    playerId: 'testPlayerId',
                    tourId: 'testTourId',
                    isCreatingRoom: true,
                },
            });
            clientSocket.on('connect', done);
        });
    });

    after(() => {
        io.close();
        clientSocket.close();
    });

    it('Server gets client connection and data from handshake', () => {
        const tourId = serverSocket.handshake.query['tourId'] as string;
        const playerId = serverSocket.handshake.query['playerId'] as string;
        const isCreatingRoom = (serverSocket.handshake.query['isCreatingRoom'] as string).toLowerCase() == 'true';
        assert.equal(playerId, 'testPlayerId');
        assert.equal(tourId, 'testTourId');
        assert.isTrue(isCreatingRoom);
    })

});