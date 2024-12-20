import { DraftPlayer } from '../src/types';
import { Player } from '../src/util/data';
import { Socket } from 'socket.io';
import { mock } from 'ts-mockito';

const mockedSockets = [
    mock(Socket),
    mock(Socket),
    mock(Socket),
    mock(Socket),
]

const playerOne = new Player();
playerOne.id = '1';
playerOne.displayName = 'sam';

const playerTwo = new Player();
playerTwo.id = '2';
playerTwo.displayName = 'ben';

const playerThree = new Player();
playerThree.id = '3';
playerThree.displayName = 'james';

const playerFour = new Player();
playerFour.id = '4';
playerFour.displayName = 'ryan';


export const testPlayers: DraftPlayer[] = [
    {
        model: playerOne,
        isReady: false,
        socket: mockedSockets[0],
        draftComplete: false,
    },
    {
        model: playerTwo,
        isReady: false,
        socket: mockedSockets[1],
        draftComplete: false,
    },
    {
        model: playerThree,
        isReady: false,
        socket: mockedSockets[2],
        draftComplete: false,
    },
    {
        model: playerFour,
        isReady: false,
        socket: mockedSockets[3],
        draftComplete: false,
    },
]
