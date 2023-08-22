import { assert } from 'chai';
import roomManager from '../src/RoomManager';
import { Player } from '../src/types';
import { testPlayers } from './testData';

describe('Room Manager basic functions', () => {

    afterEach(() => {
        roomManager.clearData();
    })

    it('Room can be added', () => {
        const added = roomManager.addRoom('testTourId', testPlayers[0]);
        assert.isTrue(added);
    });

    it('Room can be removed', () => {
        roomManager.addRoom('testTourId', testPlayers[0]);
        const removed = roomManager.removeRoom('testTourId');
        assert.isTrue(removed);
    });

    it('Adding existing room causes error', () => {
        roomManager.addRoom('testTourId', testPlayers[0]);
        const added = roomManager.addRoom('testTourId', testPlayers[0]);
        assert.isFalse(added);
    });

    it('Removing non existing room causes error', () => {

        const removed = roomManager.removeRoom('noRoom');
        assert.isFalse(removed);
    });

    it('Player can be added to existing room', () => {
        roomManager.addRoom('testRoom', testPlayers[0]);
        const added = roomManager.addPlayer(testPlayers[0], 'testRoom');
        assert.isTrue(added);
    });

    it('Existing player can be removed from room', () => {
        roomManager.addRoom('testRoom', testPlayers[0]);
        roomManager.addPlayer(testPlayers[0], 'testRoom');
        const removed = roomManager.removePlayer(testPlayers[0], 'testRoom');
        assert.isTrue(removed);
    });

    it('Player cannot be added to room that does not exist', () => {
        const added = roomManager.addPlayer(testPlayers[0], 'noRoomHere');
        assert.isFalse(added);
    });

    it('Player cannot be removed if it does not exist', () => {
        roomManager.addRoom('testRoom', testPlayers[0]);
        const removed = roomManager.removePlayer(testPlayers[0], 'testRoom');
    });

});