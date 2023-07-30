import { Server, Socket } from 'socket.io';
import server from '../src/server';
import { createServer } from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { assert } from 'chai';
import { Events } from '../src/types';

describe('Players can create and join rooms on server', () => {

    let client: ClientSocket;
    const serverUrl = 'http://localhost:3000';

    before(() => {
        server.listen(3000);

    });

    after(() => {
        server.close();
    });

    afterEach(() => {
        client.close();
    });

    it('Tour admin can connect and create a new room', (done) => {

        client = Client(serverUrl, {
            query: {
                playerId: 'tourAdminId',
                tourId: 'testTourId',
                displayName: 'testName',
                action: 'create',
            }
        });

        client.on('connect', () => {
            client.on(Events.SERVER_ROOM_CREATED, () => {
                done();
            });
        })

    });

    // it('Tour member can connect and join existing room', (done) => {

    //     client = Client(serverUrl, {
    //         query: {
    //             playerId: 'tourMemberId',
    //             tourId: 'testTourId',
    //             isCreatingRoom: false,
    //         }
    //     });

    //     client.on(Events.SERVER_ROOM_JOINED, done);

    // });

    // it('Tour admin cannot recreate existing room', (done) => {

    // });

    // it('Player cannot rejoin room they are already in', (done) => {

    // });
});