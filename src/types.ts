import { Socket } from 'socket.io';
import { Player } from './util/data';

export interface DrumCorpsCaption {
  id: string;
  corps: DrumCorps;
  caption: Caption;
}

export interface DraftPlayer {
  model: Player;
  socket: Socket;
  isReady: boolean;
  draftComplete: boolean;
}

export interface DraftStore {
  tourId: string;
  clients: DraftPlayer[];
  availablePicks: DrumCorpsCaption[];
  turnNumber: number;
  turnTimeout?: NodeJS.Timeout;
  draftInProgress: boolean;
  roundNumber: number;
  missedTurnTimeout?: NodeJS.Timeout;
}

export interface PickMessage {
  pick: DrumCorpsCaption;
}

export type Lineup = { [key: string]: DrumCorps };

export type RoomStore = { [key: string]: DraftStore };

export interface ClientIdentification {
  playerId: string;
  tourId: string;
  action: string;
}

export abstract class Events {
  static readonly CLIENT_REQUESTS_ROOM = 'CLIENT_REQUESTS_ROOM';
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
  static readonly SERVER_UPDATED_AVAILABLE_PICKS =
    'SERVER_UPDATED_AVAILABLE_PICKS';
  static readonly SERVER_DRAFT_OVER = 'SERVER_DRAFT_OVER';
  static readonly SERVER_DRAFT_BEGIN = 'SERVER_DRAFT_BEGIN';
  static readonly SERVER_START_TURN = 'SERVER_START_TURN';
  static readonly SERVER_END_TURN = 'SERVER_END_TURN';
  static readonly CLIENT_LINEUP_COMPLETE = 'CLIENT_LINEUP_COMPLETE';
  static readonly CLIENT_OWNER_BEGIN_DRAFT = 'CLIENT_OWNER_BEGIN_DRAFT';
  static readonly CLIENT_OWNER_CANCEL_DRAFT = 'CLIENT_OWNER_CANCEL_DRAFT';
  static readonly SERVER_DRAFT_CANCELLED_BY_OWNER =
    'SERVER_DRAFT_CANCELLED_BY_OWNER';
  static readonly SERVER_ALL_PLAYERS_READY = 'SERVER_ALL_PLAYERS_READY';
  static readonly SERVER_PLAYER_LEFT_DRAFT = 'SERVER_PLAYER_LEFT_DRAFT';
  static readonly SERVER_AUTO_SELECTED_PICK = 'SERVER_AUTO_SELECTED_PICK';
  static readonly SERVER_CLIENT_MISSED_TURN = 'SERVER_CLIENT_MISSED_TURN';
  static readonly CLIENT_SENDS_AUTO_PICK = 'CLIENT_SENDS_AUTO_PICK';
  static readonly SERVER_ERROR = 'SERVER_ERROR';
  static readonly CLIENT_LEAVE_ROOM = 'CLIENT_LEAVE_ROOM';
}

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
