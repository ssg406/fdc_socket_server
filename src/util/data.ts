import { Collection, getRepository } from 'fireorm';
import * as fireorm from 'fireorm';
import { DrumCorpsCaption, Lineup } from '../types';
import db from './firebase';

fireorm.initialize(db);

@Collection('remainingPicks')
export class RemainingPicks {
    id!: string;
    tourId!: string;
    leftOverPicks!: DrumCorpsCaption[];
}

const remainingPicksRepository = getRepository(RemainingPicks);

@Collection('players')
export class Player {
    id!: string;
    displayName?: string;
    about?: string;
    selectedCorps?: string;
    avatarString?: string;
    isActive?: boolean;
}

const playersRepository = getRepository(Player);

export async function getPlayer(playerId: string): Promise<Player> {
    const player = await playersRepository.findById(playerId);
    if (!player) {
        return Promise.reject()
    }
    return player;
}


export async function writeRemainingPicks(tourId: string, leftOverPicks: DrumCorpsCaption[]): Promise<void> {
    const remainingPicks = new RemainingPicks();
    remainingPicks.tourId = tourId;
    remainingPicks.leftOverPicks = leftOverPicks;
    await remainingPicksRepository.create(remainingPicks);
}
