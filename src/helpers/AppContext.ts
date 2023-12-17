import * as _ from "lodash";
import { AppContext, Game, MapPool, Round } from "../types-interfaces/Interfaces";
import { Compressed, compress, decompress } from "compress-json";
import { maps, modeAbbreviations } from "./MapMode";
import { Counterpick, Map, Mode } from "../types-interfaces/Types";

export function encodeAppContext(appContext: AppContext): string {
    const appContextClone = _.cloneDeep(appContext) as any;

    //add a version number to the encode, so we can change the encoding algorithm in the future
    //lets us make a new encoding algorithm without breaking old links
    appContextClone.v = 1;

    const targetModeSum = Object.keys(appContextClone.mapPool).length;
    let currentModeSum = 0;
    
    Object.keys(appContextClone.mapPool).forEach((key) => {
        if (appContextClone.mapPool[key].length === 0) {
            delete appContextClone.mapPool[key];
            currentModeSum++;
        }
    });

    if (currentModeSum === targetModeSum) {
        delete appContextClone.mapPool;
    }

    if (appContextClone.rounds.length === 0) {
        delete appContextClone.rounds;
    }

    const compressedContext = compress(appContextClone).toString().split("|").join("$");
    const encodedContext = encodeURIComponent(compressedContext).split("%24").join("$").split("%2C").join(",");

    return encodedContext;
}

export function decodeAppContext(encodedContext: string): AppContext {
    const decodedContext = decodeURIComponent(encodedContext).split("$").join("|").split(",");
    const compressedContext: Compressed = [
        [
            ...decodedContext.slice(0, decodedContext.length - 1)
        ],
        decodedContext[decodedContext.length - 1]
    ]
    const decompressed = decompress(compressedContext);
    const appContext: AppContext = {
        mapPool: {
            tw: decompressed.mapPool?.tw ?? [],
            sz: decompressed.mapPool?.sz ?? [],
            tc: decompressed.mapPool?.tc ?? [],
            rm: decompressed.mapPool?.rm ?? [],
            cb: decompressed.mapPool?.cb ?? []
        },
        rounds: decompressed.rounds ?? []
    };

    return appContext;
}

export function isJsonAppContext(obj: AppContext): obj is AppContext {
    return obj.mapPool !== undefined && obj.rounds !== undefined;
}

//v1's encoding algorithm still used for sendou.ink
export function encodeLegacyMapPool(appContext: AppContext) : string {
    var pools = [];
    for (var i = 0; i < modeAbbreviations.length; i++){
        const thisPool = {
            m: modeAbbreviations[i],
            p: "1"
        };

        var hasMaps = false;

        for (var j = 0; j < maps.length; j++){
            //if map is in map pool, 
            const inPool = appContext.mapPool[modeAbbreviations[i]].indexOf(maps[j]) !== -1;
            thisPool.p += inPool ? "1" : "0";
            hasMaps = inPool ? inPool : hasMaps;    
        }

        if (!hasMaps){
            continue
        }

        thisPool.p = parseInt(thisPool.p, 2).toString(16);

        pools.push(thisPool);
    }

    var stringBuilder = "";
    for (var i = 0; i < pools.length; i++){
        if (pools[i].p == ""){
            continue;
        }
        stringBuilder += pools[i].m + ":" + pools[i].p;
        if (i != pools.length - 1){
            stringBuilder += ";";
        }
    }

    return stringBuilder;
}

export function decodeLegacyMapPool(encoded: string, mapPool: MapPool): MapPool {
    const pools = encoded.split(";");
    const mapPoolClone: MapPool = _.cloneDeep(mapPool);

    for (var i = 0; i < pools.length; i++){
        var thisPool = pools[i].split(":");

        const decodedHex = thisPool[1].split('').reduce(function(acc, i) {
            return acc + ('000' + parseInt(i, 16).toString(2)).substr(-4, 4);
        }, '')


        var offset = decodedHex.length - maps.length - 1;
        var atOne = false;
        for (var j = offset; j < decodedHex.length; j++){
            if (atOne){
               if (decodedHex[j] == "1"){
                    mapPoolClone[thisPool[0] as Mode].push(maps[j - offset]);
                }
            } else {
                if (decodedHex[j] == "1"){
                    atOne = true;
                }
                offset++;
            }
        }
    }

    return mapPoolClone;
}

export function decodeLegacyRounds(encoded: string, roundsIn: Round[]): Round[] {
    const roundsClone: Round[] = _.cloneDeep(roundsIn);
    
    const rounds = encoded.split(";");

    for (var i = 0; i < rounds.length; i++){
        const roundSplit = rounds[i].split(":");
        var round: Round = {
            name: roundSplit[0].split("_").join(" "),
            games: [] as (Game | Counterpick)[],
            playStyle: "bestOf"
        };

        const mapModes = roundSplit[1].split(",");
        for (var j = 0; j < mapModes.length; j++){

            const split = mapModes[j].split("-");
            var mode = split[0];

            switch(mode){
                case "0": mode = "tw"; break;
                case "1": mode = "sz"; break;
                case "2": mode = "tc"; break;
                case "3": mode = "rm"; break;
                case "4": mode = "cb"; break;
                case "5": mode = ""; break;
            }

            if (split[1] == "un" || mode == ""){
                round.games.push("counterpick");
            } else {
                const map = maps[parseInt(split[1])];
                round.games.push({
                    map: map as Map,
                    mode: mode as Mode
                } as Game);
            }

        }
        roundsClone.push(round as Round);
    }

    return roundsClone;
}