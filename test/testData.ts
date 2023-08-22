import { Player } from '../src/types';
import { Socket } from 'socket.io';
import { mock } from 'ts-mockito';

const mockedSockets = [
    mock(Socket),
    mock(Socket),
    mock(Socket),
    mock(Socket),
]

export const testPlayers: Player[] = [
    {
        displayName: 'Sam',
        playerId: '1',
        isReady: false,
        socket: mockedSockets[0],
        draftComplete: false,
    },
    {
        displayName: 'Ben',
        playerId: '2',
        isReady: false,
        socket: mockedSockets[1],
        draftComplete: false,
    },
    {
        displayName: 'Jordan',
        playerId: '3',
        isReady: false,
        socket: mockedSockets[2],
        draftComplete: false,
    },
    {
        displayName: 'Stephanie',
        playerId: '4',
        isReady: false,
        socket: mockedSockets[3],
        draftComplete: false,
    },
]
