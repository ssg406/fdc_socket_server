// import { assert } from 'chai';
// import RoomManager from '../src/RoomManager';
// import { Player } from '../src/types';
// import { Socket } from 'socket.io';
// import sinon from 'sinon';

// const fakeSocket: Partial<Socket> = {};

// const testPlayer: Player = {
//     playerId: 'playerId',
//     displayName: 'Test Player',
//     isReady: false,
//     socket: fakeSocket,
// }

// describe('Room Manager basic functions', () => {
//     let roomManager: RoomManager;

//     beforeEach(() => {
//         roomManager = new RoomManager();
//     });

//     it('Room can be added', () => {
//         const added = roomManager.addRoom('testTourId');
//         assert.isTrue(added);
//     });

//     it('Room can be removed', () => {
//         roomManager.addRoom('testTourId');
//         const removed = roomManager.removeRoom('testTourId');
//         assert.isTrue(removed);
//     });

//     it('Adding existing room causes error', () => {
//         roomManager.addRoom('testTourId');
//         const added = roomManager.addRoom('testTourId');
//         assert.isFalse(added);
//     });

//     it('Removing non existing room causes error', () => {

//         const removed = roomManager.removeRoom('noRoom');
//         assert.isFalse(removed);
//     });

//     it('Player can be added to existing room', () => {
//         roomManager.addRoom('testRoom');
//         const added = roomManager.addPlayer(testPlayer, 'testRoom');
//         assert.isTrue(added);
//     });

//     it('Existing player can be removed from room', () => {
//         roomManager.addRoom('testRoom');
//         roomManager.addPlayer(testPlayer, 'testRoom');
//         const removed = roomManager.removePlayer(testPlayer.playerId, 'testRoom');
//         assert.isTrue(removed);
//     });

//     it('Player cannot be added to room that does not exist', () => {
//         const added = roomManager.addPlayer(testPlayer, 'testRoom');
//         assert.isFalse(added);
//     });

//     it('Player cannot be removed if it does not exist', () => {
//         roomManager.addRoom('testRoom');
//         const removed = roomManager.removePlayer(testPlayer.playerId, 'testRoom');
//     });
// });