import * as _ from "lodash";
import { AppContext } from "../types-interfaces/Interfaces";
import { Compressed, compress, decompress } from "compress-json";

export function encodeAppContext(appContext: AppContext): string {
    const appContextClone = _.cloneDeep(appContext) as any;

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
    const encodedContext = encodeURIComponent(compressedContext).split("%24").join("$");

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