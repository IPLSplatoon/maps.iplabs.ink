import { maps, modeAbbreviations } from "../helpers/MapMode";

export type Counterpick = "counterpick";

export type Map = typeof maps[number];

export type Mode = typeof modeAbbreviations[number];

export type PlayStyle = "bestOf" | "playAll";