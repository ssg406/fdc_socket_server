import { testPlayers } from './testData';
import roomManager from '../src/RoomManager';
import DraftMember from '../src/Draft';
import sinon from 'sinon';
import chai, { assert, expect } from 'chai';
import sinonChai from 'sinon-chai';

chai.should();
chai.use(sinonChai);

describe('DraftMember object functions', () => {

    const sandbox = sinon.createSandbox();

    afterEach(() => {
        sandbox.restore();
        roomManager.clearData();
    })

    it('Create new draft member in new room', () => {
        const tourId = 'testTourId';
        const createRoomSpy = sandbox.spy(roomManager, 'addRoom');
        const addPlayerSpy = sandbox.spy(roomManager, 'addPlayer');
        const player = new DraftMember(testPlayers[0], tourId, 'create');

        player.init().should.be.true;
        createRoomSpy.should.have.been.calledOnceWith(tourId, testPlayers[0]);
        addPlayerSpy.should.have.been.calledOnceWith(testPlayers[0], tourId);

    });

    it('Create new draft member in existing room', () => {
        const tourId = 'testTourId';
        const addPlayerSpy = sandbox.spy(roomManager, 'addPlayer');
        const player = new DraftMember(testPlayers[0], tourId, 'create');
        const joinedPlayer = new DraftMember(testPlayers[1], tourId, 'join');
        player.init();

        joinedPlayer.init().should.be.true;
        addPlayerSpy.should.have.been.calledTwice;
        roomManager.rooms[tourId].clients.length.should.equal(2);
    });


})