import { Mode } from "../types-interfaces/Types";

export const modeAbbreviations = ['tw', 'sz', 'tc', 'rm', 'cb'] as const;

export function modeAbbreviationToWords(mode: Mode) {
    switch (mode) {
        case 'tw':
            return 'Turf War';
        case 'sz':
            return 'Splat Zones';
        case 'tc':
            return 'Tower Control';
        case 'rm':
            return 'Rainmaker';
        case 'cb':
            return 'Clam Blitz';
    }
}

export const maps = [
    "Scorch Gorge",
    "Eeltail Alley",
    "Hagglefish Market",
    "Undertow Spillway",
    "Mincemeat Metalworks",
    "Hammerhead Bridge",
    "Museum d'Alfonsino",
    "Mahi-Mahi Resort",
    "Inkblot Art Academy",
    "Sturgeon Shipyard",
    "MakoMart",
    "Wahoo World",
    "Flounder Heights",
    "Brinewater Springs",
    "Manta Maria",
    "Um'ami Ruins",
    "Humpback Pump Track",
    "Barnacle & Dime",
    "Crableg Capital",
    "Shipshape Cargo Co.",
    "Bluefin Depot",
    "Robo ROM-en",
    "Marlin Airport",
    "Lemuria Hub"
] as const;

export function getPlayStyleString(playStyle: "bestOf" | "playAll", numGames: number): string {
    return (playStyle === "bestOf" ? "Best of " : "Play all ") + numGames;
}