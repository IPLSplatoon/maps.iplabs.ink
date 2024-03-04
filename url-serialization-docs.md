# How maps.iplabs.ink serializes and deserializes URL data

*Last updated August 2022*

Data can be stored in the URL to share map pool and map lists without needing a backend storage solution. The data found in the URL needs to be compressed to keep the URL length in check. This doc will explain how that process works in case other developers in the Splatoon community want to adopt this as a standard.

Example URL: *Will not work until splat3 branch is live, use [this link](https://splat3.iplmapgen2.pages.dev/?3&pool=tw:1998;sz:1d0a;tc:164c;rm:15e0;cb:1ce0&rounds=Round_1:1-1,2-2,3-5;Round_2:4-4,0-3,1-0;Round_3:2-9,3-1,4-5) for now*
```
https://maps.iplabs.ink/?3&pool=tw:1998;sz:1d0a;tc:164c;rm:15e0;cb:1ce0&rounds=Round_1:1-1,2-2,3-5;Round_2:4-4,0-3,1-0;Round_3:2-9,3-1,4-5
                        ^1 ^2                                           ^3
```
1. Signifies this map list is for Splatoon 3. The site will assume it's a Splatoon 2 map list if it's not present. I wanted to keep Splatoon 2 URL compatibility while making this standard work for Splatoon 3.
2. Denotes the map pool for each mode present. Each mode is separated by a `;`. Each mode is labeled `sz`, `tc`, `rm`, or `cb` and followed by a `:` to signify which mode the pool is for.
3. Denotes the map list. Each round in the map list is separated by a `;`. The name of each round is followed by a `:`. The name can only use alphanumeric characters, and each space character is replaced by an `_`. Each map and mode are separated by `-`, and each map and mode combo (aka each "game" of the round) are separated by `,`.

**Remember map pools and map lists are separate things!**

## Map pool serialization
The following process repeats for each mode that features maps:

Looping in order of the map lists found in [data.js](data.js) (private battle order of each game's map list, **subject to change when Splatoon 3 launches**), build a binary number with 0 being unselected and 1 being selected. Add a 1 at the start of the number to maintain leading zeros. Then convert the binary number to hexadecimal.

### Example: 
Making a map pool containing Scorch Gorge, Undertow Spillway, Mincemeat Metalworks, and Hammerhead Bridge. First, cross reference the order of the maps in [data.js](data.js), and create a binary number out of which maps you want, then add a 1 at the beginning. The number should be 1100111000000<sub>2</sub>. Finally, convert it to hex, which should be 19c0<sub>16</sub>.

## Map pool deserialization
The following process repeats for each mode featured in the URL:

Deserialization is essentially serialization in reverse. First, convert the hexadecimal value into binary. Your conversion may add some leading zeros to the number, in that case, skip to the first 1 found in the number (if it didn't, ignore this). Cross-reference the order of the maps found in [data.js](data.js). Each bit equal to 1 in the binary number means the map is included in the map pool.

### Example:
Taking 19c0<sub>16</sub> and converting it to a map pool. First, convert it to binary, which should be 1100111000000<sub>2</sub>. Remember; if your conversion adds extra 0s at the start of the number, you can ignore them until the first 1 appears. Skip the first one found in the number since it's just there to keep any leading zeros between the conversion from hex to binary and back. For each map in [data.js](data.js) AND for each bit found in the number, check if the bit in the same index as the map is 1. If it is, then include this map. In this case, you could get a pool containing Scorch Gorge, Undertow Spillway, Mincemeat Metalworks, and Hammerhead Bridge.

## Map list serialization
The following process repeats for each round in your map list:

First, note the name of your round. Ensure it uses only alphanumeric characters (otherwise, yell at your end-user). Next, for each game in the round, denote the mode of the round with a 0 being turf war, 1 being splat zones, 2 being tower control, 3 being rainmaker, and 4 being clam blitz. Then denote the map featured in the game with the index of the map in [data.js](data.js). Separate these two numbers with a `-`. Combine all the games separating them with a `,`, then combine all rounds, separating them with a `;`.

### Example:
Serializing the following rounds:

- Round 1: SZ Eeltail Alley, TC Hagglefish Market, RM Hammerhead.
- Round 2: CB Mincemeat Metalworks, TW Undertow Spillway, SZ Scorch Gorge.

Following the instructions above, you should get the following:
`Round_1:1-1,2-2,3-5;Round_2:4-4,0-3,1-0`

## Map list deserialization
Map list deserialization is essentially serialization in reverse. For each round (split each `;`), denote the name to the left of the `:`. Replace each `_` in the name with a space. Each game in the round is separated by `,`. Each map and mode per game are separated by `-`. The mode is the value on the left; 0 being turf war, 1 being splat zones, 2 being tower control, 3 being rainmaker, and 4 being clam blitz. The map is the value on the right, the number referencing the index of the map found in [data.js](data.js).

### Example
Deserializing the following round:

- `Round_3:2-9,3-1,4-5`

The name of the round is "Round 3". The first game is Tower Control on Sturgeon Shipyard, the second being Rainmaker on Eeltail Alley, and the third on Clam Blitz Hammerhead Bridge.
