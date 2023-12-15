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
    const mapTracker: Map[] = [];
    const MAP_TRACKER_LENGTH = getMapQueueLength(mapPool, modes);

    //for each round
    for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];

        //for each game in round
        for (let j = 0; j < round.games.length; j++) {
            console.log(round.name, j, modeTracker, mapTracker);
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
                    const newGame = getRandomGame(mapTracker, modeTracker, mapPool, modes);
                    round.games[j] = newGame;
                    addToMapTracker(mapTracker, newGame.map, MAP_TRACKER_LENGTH);
                    addToModeTracker(modeTracker, newGame.mode, MODE_TRACKER_LENGTH);
                    continue;
                }

            //if game is not counterpick (has a map and mode)
            } else {

                //if round is not set as "do not modify"
                if (dnmRoundIndices.indexOf(i) !== -1) {
                    
                    //we still want to track the map & mode, but not modify the round
                    addToMapTracker(mapTracker, game.map, MAP_TRACKER_LENGTH);
                    addToModeTracker(modeTracker, game.mode, MODE_TRACKER_LENGTH);
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
                    const newGame = getRandomGame(mapTracker, modeTracker, mapPool, modes);
                    round.games[j] = newGame;
                    addToMapTracker(mapTracker, newGame.map, MAP_TRACKER_LENGTH);
                    addToModeTracker(modeTracker, newGame.mode, MODE_TRACKER_LENGTH);
                    continue;

                //if generation is set to "Replace Counterpicks"
                } else {

                    //we still want to track the map & mode, but not modify the round
                    addToMapTracker(mapTracker, game.map, MAP_TRACKER_LENGTH);
                    addToModeTracker(modeTracker, game.mode, MODE_TRACKER_LENGTH);
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
    return Math.max(0, lowest / 2);
}

function addToMapTracker(mapTracker: Map[], map: Map, len: number): void {
    mapTracker.push(map);
    if (mapTracker.length > len) mapTracker.shift();
}

function addToModeTracker(modeTracker: Mode[], mode: Mode, len: number): void {
    modeTracker.push(mode);
    if (modeTracker.length > len) modeTracker.shift();
}

function getRandomGame(mapTracker: Map[], modeTracker: Mode[], mapPool: MapPool, modes: Mode[]): Game {
    const mode = getRandomMode(modes, modeTracker);
    const map = getRandomMap(mapPool, mode, mapTracker);
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

function getRandomMap(mapPool: MapPool, mode: Mode, mapTracker: Map[]): Map {
    //get a random map from the map pool that doesn't appear in the map tracker
    let map: Map;
    do {
        map = _.sample(mapPool[mode]) as Map;
    } while (mapTracker.indexOf(map) !== -1);
    return map;
}