import { Collection, getRepository } from 'fireorm';
import * as fireorm from 'fireorm';
import { DrumCorpsCaption } from '../types';
import db from './firebase';

fireorm.initialize(db);

@Collection('remainingPicks')
export class RemainingPicks {
    id!: string;
    tourId!: string;
    leftOverPicks!: DrumCorpsCaption[];
}

const remainingPicksRepository = getRepository(RemainingPicks);

export const writeData = {
    writeRemainingPicks: async function (tourId: string, leftOverPicks: DrumCorpsCaption[]) {
        const remainingPicks = new RemainingPicks();
        remainingPicks.tourId = tourId;
        remainingPicks.leftOverPicks = leftOverPicks;
        await remainingPicksRepository.create(remainingPicks);
    }
}