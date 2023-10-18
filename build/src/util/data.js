"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markTourDraftComplete = exports.writeRemainingPicks = exports.getPlayer = exports.Player = exports.RemainingPicks = void 0;
const fireorm_1 = require("fireorm");
const fireorm = __importStar(require("fireorm"));
const firebase_1 = __importDefault(require("./firebase"));
const visible_logger_1 = __importDefault(require("visible_logger"));
fireorm.initialize(firebase_1.default);
let RemainingPicks = exports.RemainingPicks = class RemainingPicks {
};
exports.RemainingPicks = RemainingPicks = __decorate([
    (0, fireorm_1.Collection)('remainingPicks')
], RemainingPicks);
const remainingPicksRepository = (0, fireorm_1.getRepository)(RemainingPicks);
let Player = exports.Player = class Player {
};
exports.Player = Player = __decorate([
    (0, fireorm_1.Collection)('players')
], Player);
const playersRepository = (0, fireorm_1.getRepository)(Player);
function getPlayer(playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield playersRepository.findById(playerId);
        if (!player) {
            return Promise.reject();
        }
        return player;
    });
}
exports.getPlayer = getPlayer;
function writeRemainingPicks(tourId, leftOverPicks) {
    return __awaiter(this, void 0, void 0, function* () {
        const remainingPicks = new RemainingPicks();
        remainingPicks.tourId = tourId;
        remainingPicks.leftOverPicks = leftOverPicks;
        yield remainingPicksRepository.create(remainingPicks);
    });
}
exports.writeRemainingPicks = writeRemainingPicks;
let Tour = class Tour {
};
Tour = __decorate([
    (0, fireorm_1.Collection)('tours')
], Tour);
exports.default = Tour;
const toursRepository = (0, fireorm_1.getRepository)(Tour);
function markTourDraftComplete(tourId) {
    return __awaiter(this, void 0, void 0, function* () {
        const tour = yield toursRepository.findById(tourId);
        if (!tour) {
            visible_logger_1.default.warn(`Could not find tour ${tourId} in database, unable to mark complete`, 'Firestore');
            return;
        }
        tour.draftComplete = true;
        yield toursRepository.update(tour);
    });
}
exports.markTourDraftComplete = markTourDraftComplete;
