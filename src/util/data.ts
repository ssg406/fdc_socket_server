import { Collection, getRepository } from 'fireorm';
import * as fireorm from 'fireorm';
import { DrumCorpsCaption, Lineup } from '../types';
import db from './firebase';
import logger from 'visible_logger';

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
    return Promise.reject();
  }
  return player;
}

export async function writeRemainingPicks(
  tourId: string,
  leftOverPicks: DrumCorpsCaption[]
): Promise<void> {
  const remainingPicks = new RemainingPicks();
  remainingPicks.tourId = tourId;
  remainingPicks.leftOverPicks = leftOverPicks;
  await remainingPicksRepository.create(remainingPicks);
}

@Collection('tours')
export default class Tour {
  id!: string;
  name!: string;
  description?: string;
  isPublic!: boolean;
  owner!: string;
  members!: Array<string>;
  draftDateTime!: string;
  password?: string;
  draftActive!: boolean;
  draftComplete!: boolean;
}

const toursRepository = getRepository(Tour);

export async function markTourDraftComplete(tourId: string) {
  const tour = await toursRepository.findById(tourId);
  if (!tour) {
    logger.warn(
      `Could not find tour ${tourId} in database, unable to mark complete`,
      'Firestore'
    );
    return;
  }

  tour.draftComplete = true;
  await toursRepository.update(tour);
}
