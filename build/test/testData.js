"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testPlayers = void 0;
const data_1 = require("../src/util/data");
const socket_io_1 = require("socket.io");
const ts_mockito_1 = require("ts-mockito");
const mockedSockets = [
    (0, ts_mockito_1.mock)(socket_io_1.Socket),
    (0, ts_mockito_1.mock)(socket_io_1.Socket),
    (0, ts_mockito_1.mock)(socket_io_1.Socket),
    (0, ts_mockito_1.mock)(socket_io_1.Socket),
];
const playerOne = new data_1.Player();
playerOne.id = '1';
playerOne.displayName = 'sam';
const playerTwo = new data_1.Player();
playerTwo.id = '2';
playerTwo.displayName = 'ben';
const playerThree = new data_1.Player();
playerThree.id = '3';
playerThree.displayName = 'james';
const playerFour = new data_1.Player();
playerFour.id = '4';
playerFour.displayName = 'ryan';
exports.testPlayers = [
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
];
