import { Counterpick, PlayStyle, Map, Mode } from "./Types";

export interface AppContext {
    mapPool: MapPool
    rounds: Round[]
}

export interface MapPool {
    tw: Map[],
    sz: Map[],
    tc: Map[],
    rm: Map[],
    cb: Map[]
}

export interface Round {
    name: string,
    playStyle: PlayStyle,
    games: (Game | Counterpick)[]
}

export interface Game {
    map: Map,
    mode: Mode
}