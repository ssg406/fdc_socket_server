import { Socket } from "socket.io";
import { Adapter } from "socket.io-adapter";

export enum Caption {
    ge1 = 'ge1',
    ge2 = 'ge2',
    visualProficiency = 'visualProficiency',
    visualAnalysis = 'visualAnalysis',
    colorGuard = 'colorGuard',
    brass = 'brass',
    musicAnalysis = 'musicAnalysis',
    percussion = 'percussion',
}

export enum DrumCorps {
    theAcademy = 'theAcademy',
    blueDevils = 'blueDevils',
    blueKnights = 'blueKnights',
    blueStars = 'blueStars',
    bluecoats = 'bluecoats',
    bostonCrusaders = 'bostonCrusaders',
    theCadets = 'theCadets',
    carolinaCrown = 'carolinaCrown',
    theCavaliers = 'theCavaliers',
    colts = 'colts',
    crossmen = 'crossmen',
    genesis = 'genesis',
    jerseySurf = 'jerseySurf',
    madisonScouts = 'madisonScouts',
    mandarins = 'mandarins',
    musicCity = 'musicCity',
    pacificCrest = 'pacificCrest',
    phantomRegiment = 'phantomRegiment',
    santaClaraVanguard = 'santaClaraVanguard',
    seattleCascades = 'seattleCascades',
    spiritOfAtlanta = 'spiritOfAtlanta',
    troopers = 'troopers',
}

export interface DrumCorpsCaption {
    drumCorpsCaptionId: string;
    corps: DrumCorps;
    caption: Caption;
}

export interface Player {
    playerId: string;
    displayName: string;
    socket: Socket;
    isReady: boolean;
}

export interface DraftStore {
    tourId: string;
    clients: Player[];
    availablePicks: DrumCorpsCaption[];
    turnNumber: number;
    turnTimeout?: NodeJS.Timeout;
}

export interface RoomOptions {
    player: Player;
    tourId: string;
    action: string;
}

export abstract class Events {
    static readonly CONNECT = 'CONNECT';
    static readonly SERVER_ROOM_CREATED = 'SERVER_ROOM_CREATED';
    static readonly SERVER_ROOM_CREATE_FAILED = 'SERVER_ROOM_CREATE_FAILED';
    static readonly SERVER_ROOM_ALREADY_EXISTS = 'SERVER_ROOM_ALREADY_EXISTS';
    static readonly SERVER_ROOM_JOINED = 'SERVER_ROOM_JOINED';
    static readonly SERVER_ROOM_JOIN_FAILED = 'SERVER_ROOM_JOIN_FAILED';
    static readonly SERVER_PLAYER_ALREADY_JOINED = 'SERVER_PLAYER_ALREADY_JOINED';
    static readonly SERVER_UPDATE_JOINED_PLAYERS = 'SERVER_UPDATE_JOINED_PLAYERS';
    static readonly CLIENT_READY_FOR_DRAFT = 'CLIENT_READY_FOR_DRAFT';
    static readonly CLIENT_PLAYER_ENDS_TURN = 'CLIENT_PLAYER_ENDS_TURN';
}