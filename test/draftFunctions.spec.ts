import roomManager from '../src/RoomManager';
import { testPlayers } from './testData';
import sinon from 'sinon';
import chai, { assert, expect } from 'chai';
import { allPicks } from '../src/util/allPicks';
import sinonChai from 'sinon-chai';

chai.should();
chai.use(sinonChai);

function setupTestRoom(tourId: string): void {
    roomManager.addRoom(tourId, testPlayers[0]);
    testPlayers.forEach((player) => {
        roomManager.addPlayer(player, tourId);
    });
}

describe('Room Manager draft functions', () => {
    const sandbox = sinon.createSandbox();
    const clock = sinon.useFakeTimers();

    afterEach(() => {
        sandbox.restore();
        roomManager.clearData();
    });

    after(() => {
        clock.restore();
    })

    it('markPlayerReady marks a player as ready, checkPlayersReady returns true when all players are ready', () => {
        const tourId = 'markPlayerReadyTest';
        setupTestRoom(tourId);

        roomManager.checkPlayersReady(tourId).should.be.false;

        testPlayers.forEach((player) => {
            roomManager.markPlayerReady(tourId, player.model.id);
        });

        roomManager.checkPlayersReady(tourId).should.be.true;
    });

    it('shufflePlayers shuffles the list of players', () => {
        const tourId = 'shufflePlayersTest';
        setupTestRoom(tourId);

        const playerIdsArray = roomManager.rooms[tourId].clients.map((player) => player.model.id);
        roomManager.shufflePlayers(tourId);
        const shuffledPlayerIdsArray = roomManager.rooms[tourId].clients.map((player) => player.model.id);

        JSON.stringify(playerIdsArray).should.not.equal(JSON.stringify(shuffledPlayerIdsArray));

    });

    it('removePick removes a DrumCorpsCaption from the list of available picks', () => {
        const tourId = 'pickRemovalTest';
        setupTestRoom(tourId);
        roomManager.removePick(tourId, allPicks[0]);
        const foundPick = roomManager.rooms[tourId].availablePicks.find((dcc) => dcc.drumCorpsCaptionId === allPicks[0].drumCorpsCaptionId);

        expect(foundPick).to.be.undefined;
        allPicks.length.should.not.equal(roomManager.rooms[tourId].availablePicks.length)

    })

    it('serverEndsTurn and processTurnResult run when timer runs out for the current turn', () => {
        const spy = sandbox.spy(roomManager);
        const tourId = 'testRoom';
        setupTestRoom(tourId);
        const numberOfPicks = roomManager.rooms[tourId].availablePicks.length;
        roomManager.startTurn(tourId);

        clock.runToLast();

        spy._serverEndsTurn.should.have.been.calledOnce;
        spy._processTurnResult.should.have.been.calledOnce;
    });

    it('playerEndsTurn clears timeout, processes player choice, removes pick, and advances turn', () => {
        const tourId = 'testRoom';
        const spy = sandbox.spy(clock, 'clearTimeout');
        setupTestRoom(tourId);

        const expectedTurnNumber = (roomManager.rooms[tourId].turnNumber + 1) % roomManager.rooms[tourId].clients.length;

        roomManager.startTurn(tourId);
        roomManager.playerEndsTurn(tourId, allPicks[0]);

        spy.should.have.been.calledOnce;

        const foundPick = roomManager.rooms[tourId].availablePicks.find((dcc) => dcc.drumCorpsCaptionId === allPicks[0].drumCorpsCaptionId);
        expect(foundPick).to.be.undefined;

        const newTurnNumber = roomManager.rooms[tourId].turnNumber;
        newTurnNumber.should.equal(expectedTurnNumber);
    });

    it('processTurnResult advances turn numbers and  calls shufflePlayers when turn number returns to 0', () => {
        const spy = sandbox.spy(roomManager);
        const tourId = 'testShuffle';
        setupTestRoom(tourId);

        roomManager.startTurn(tourId);

        roomManager.rooms[tourId].turnNumber.should.equal(0);
        roomManager.playerEndsTurn(tourId, allPicks[0]);
        clock.tick(100);

        roomManager.rooms[tourId].turnNumber.should.equal(1);
        roomManager.playerEndsTurn(tourId, allPicks[1]);
        clock.tick(100);

        roomManager.rooms[tourId].turnNumber.should.equal(2);
        roomManager.playerEndsTurn(tourId, allPicks[2]);
        clock.tick(100);

        roomManager.rooms[tourId].turnNumber.should.equal(3);
        roomManager.playerEndsTurn(tourId, allPicks[3]);
        clock.tick(100);

        roomManager.rooms[tourId].turnNumber.should.equal(0);
        spy.shufflePlayers.should.have.been.calledOnce;

    });

    it('Removing player of current turn ends turn and recalculates turn number', () => {
        const tourId = 'testRemoval';
        const spy = sandbox.spy(clock, 'clearTimeout');
        setupTestRoom(tourId);

        roomManager.startTurn(tourId);

        roomManager.rooms[tourId].turnNumber.should.equal(0);
        roomManager.playerEndsTurn(tourId, allPicks[0]);
        clock.tick(100);

        roomManager.rooms[tourId].turnNumber.should.equal(1);
        roomManager.playerEndsTurn(tourId, allPicks[1]);
        clock.tick(100);

        roomManager.rooms[tourId].turnNumber.should.equal(2);

        roomManager.removeActivePlayer(testPlayers[roomManager.rooms[tourId].turnNumber], tourId);
        clock.tick(100);

        roomManager.rooms[tourId].turnNumber.should.equal(1);

        spy.should.have.been.calledThrice;

    })

    it('Removing non-current turn player ', () => {
        const tourId = 'testRemoval';
        const spy = sandbox.spy(clock, 'clearTimeout');
        setupTestRoom(tourId);

        roomManager.startTurn(tourId);

        roomManager.rooms[tourId].turnNumber.should.equal(0);
        roomManager.playerEndsTurn(tourId, allPicks[0]);
        clock.tick(100);

        roomManager.rooms[tourId].turnNumber.should.equal(1);

        roomManager.removeActivePlayer(testPlayers[0], tourId);

        roomManager.rooms[tourId].turnNumber.should.equal(1);

        roomManager.playerEndsTurn(tourId, allPicks[10]);
        clock.tick(100);

        roomManager.rooms[tourId].turnNumber.should.equal(2);
    });
});