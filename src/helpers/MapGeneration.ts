import _ from "lodash";
import { Game, MapPool, Round } from "../types-interfaces/Interfaces";
import { GenerateMode, Map, Mode } from "../types-interfaces/Types";
import { modeAbbreviations } from "./MapMode";

//extra verbose comments to help walk through algorithm
export function generateRounds(originalRounds: Round[], mapPool: MapPool, generateMode: GenerateMode, modes: Mode[], dnmRoundIndices: number[], counterpickRoundIndices: number[]): Round[] {
    const rounds = _.cloneDeep(originalRounds);

    //track the modes that appear as the algorithm runs, the array can only be as long as the number of modes
    const modeTracker: Mode[] = [];
    const MODE_TRACKER_LENGTH = modes.length - 1;

    //track the maps that appear as the algorithm runs, the array can only be as long as half the number of maps in the smallest map pool
    const recentMapTracker: Map[] = [];
    const RECENT_MAP_TRACKER_LENGTH = getMapQueueLength(mapPool, modes);

    //track the number of times a map has been played for each mode
    const modeMapTracker = {} as any;
    for (let i = 0; i < modeAbbreviations.length; i++) {
        modeMapTracker[modeAbbreviations[i]] = {};
        for (let j = 0; j < mapPool[modeAbbreviations[i]].length; j++) {
            modeMapTracker[modeAbbreviations[i]][mapPool[modeAbbreviations[i]][j]] = 0;
        }
    }

    //for each round
    for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];

        //for each game in round
        for (let j = 0; j < round.games.length; j++) {
            const game = round.games[j];
            
            //if game is counterpick
            if (game === "counterpick"){

                //if round is not set as "do not modify"
                if (dnmRoundIndices.indexOf(i) !== -1) {
                                    
                    //don't touch ANYTHING!
                    continue;
                }

                //if round is set as counterpick and its not the first game in the round
                if (counterpickRoundIndices.indexOf(i) !== -1 && j !== 0) {

                    //set this game as a counterpick
                    round.games[j] = "counterpick";
                    continue;
                }

                //if generation is set to "Replace Counterpicks" or "Replace All"
                if (generateMode === "Replace Counterpicks" || generateMode === "Replace All") {

                    //generate a new game and replace the game
                    const newGame = getRandomGame(recentMapTracker, modeTracker, mapPool, modes, modeMapTracker);
                    round.games[j] = newGame;
                    addToMapTracker(recentMapTracker, newGame.map, RECENT_MAP_TRACKER_LENGTH);
                    addToModeTracker(modeTracker, newGame.mode, MODE_TRACKER_LENGTH);
                    addToModeMapTracker(modeMapTracker, newGame.mode, newGame.map);
                    continue;
                }

            //if game is not counterpick (has a map and mode)
            } else {

                //if round is not set as "do not modify"
                if (dnmRoundIndices.indexOf(i) !== -1) {
                    
                    //we still want to track the map & mode, but not modify the round
                    addToMapTracker(recentMapTracker, game.map, RECENT_MAP_TRACKER_LENGTH);
                    addToModeTracker(modeTracker, game.mode, MODE_TRACKER_LENGTH);
                    addToModeMapTracker(modeMapTracker, game.mode, game.map);
                    continue;
                }

                //if round is set as counterpick and its not the first game in the round
                if (counterpickRoundIndices.indexOf(i) !== -1 && j !== 0) {

                    //set this game as a counterpick
                    round.games[j] = "counterpick";
                    continue;
                }

                //if generation is set to "Replace Non-Counterpicks" or "Replace All"
                if (generateMode === "Replace Non-Counterpicks" || generateMode === "Replace All") {

                    //generate a new game and replace the game
                    const newGame = getRandomGame(recentMapTracker, modeTracker, mapPool, modes, modeMapTracker);
                    round.games[j] = newGame;
                    addToMapTracker(recentMapTracker, newGame.map, RECENT_MAP_TRACKER_LENGTH);
                    addToModeTracker(modeTracker, newGame.mode, MODE_TRACKER_LENGTH);
                    addToModeMapTracker(modeMapTracker, newGame.mode, newGame.map);
                    continue;

                //if generation is set to "Replace Counterpicks"
                } else {

                    //we still want to track the map & mode, but not modify the round
                    addToMapTracker(recentMapTracker, game.map, RECENT_MAP_TRACKER_LENGTH);
                    addToModeTracker(modeTracker, game.mode, MODE_TRACKER_LENGTH);
                    addToModeMapTracker(modeMapTracker, game.mode, game.map);
                    continue;
                }
            }
        }
    }

    return rounds;
}

function getMapQueueLength(mapPool: MapPool, modes: Mode[]): number {
    let lowest = Infinity;
    for (let i = 0; i < modeAbbreviations.length; i++) {
        if (modes.indexOf(modeAbbreviations[i]) === -1) continue;
        const mode = mapPool[modeAbbreviations[i]];
        if (mode.length < lowest) lowest = mode.length;
    }
    return Math.max(0, Math.ceil(lowest / 2));
}

function addToMapTracker(mapTracker: Map[], map: Map, len: number): void {
    mapTracker.push(map);
    if (mapTracker.length > len) mapTracker.shift();
}

function addToModeTracker(modeTracker: Mode[], mode: Mode, len: number): void {
    modeTracker.push(mode);
    if (modeTracker.length > len) modeTracker.shift();
}

function addToModeMapTracker(modeMapTracker: any, mode: Mode, map: Map): void {
    modeMapTracker[mode][map]++;
}

function getRandomGame(mapTracker: Map[], modeTracker: Mode[], mapPool: MapPool, modes: Mode[], modeMapTracker: any): Game {
    const mode = getRandomMode(modes, modeTracker);
    const map = getRandomMap(mapPool, mode, modeMapTracker, mapTracker);
    return {map, mode};
}

function getRandomMode(modes: Mode[], modeTracker: Mode[]): Mode {
    //get a random mode from the modes array that doesn't appear in the mode tracker
    let mode: Mode;
    do {
        mode = _.sample(modes) as Mode;
    } while (modeTracker.indexOf(mode) !== -1);
    return mode;
}

function getRandomMap(mapPool: MapPool, mode: Mode, modeMapTracker: any, mapTracker: Map[]): Map {
    //get a random map from the map pool that doesn't appear in the map tracker
    
    let mapsToPick = mapPool[mode].filter(map => mapTracker.indexOf(map) === -1);
    if (mapsToPick.length === 0) mapsToPick = mapPool[mode];

    //set a target frequency for the map, based on the number of times the map has already appeared
    let modeMapFrequencyTarget = _.min(_.values(modeMapTracker[mode]));
    
    let map: Map;
    let safety = 50;
    do {
        map = _.sample(mapsToPick) as Map;
        safety--;
        if (safety === 0) {
            safety = 50;
            modeMapFrequencyTarget++;
        }
    } while (modeMapTracker[mode][map] > modeMapFrequencyTarget);

    return map;
}