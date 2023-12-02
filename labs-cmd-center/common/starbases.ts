export const Starbases = {
  MUD: [0, -39],
  MUD2: [2, -34],
  MUD3: [10, -41],
  MUD4: [-2, -44],
  MUD5: [-10, -37],
  MRZ1: [-15, -33],
  MRZ2: [12, -31],
  MRZ3: [-22, -25],
  MRZ4: [-8, -24],
  MRZ5: [2, -23],
  MRZ6: [11, -16],
  MRZ7: [21, -26],
  MRZ8: [-30, -16],
  MRZ9: [-14, -16],
  MRZ10: [23, -12],
  MRZ11: [31, -19],
  MRZ12: [-16, 0],
  ONI: [-40, 30],
  ONI2: [-42, 35],
  ONI3: [-30, 30],
  ONI4: [-38, 25],
  ONI5: [-47, 30],
  MRZ13: [-36, -7],
  MRZ14: [-23, 4],
  MRZ18: [-40, 3],
  MRZ19: [-35, 12],
  MRZ20: [-25, 15],
  MRZ24: [-45, 15],
  MRZ25: [-18, 23],
  MRZ26: [-9, 24],
  MRZ29: [-22, 32],
  MRZ30: [-19, 40],
  MRZ31: [-8, 35],
  MRZ36: [0, 16],
  Ustur: [40, 30],
  UST2: [42, 35],
  UST3: [48, 32],
  UST4: [38, 25],
  UST5: [30, 28],
  MRZ15: [22, 5],
  MRZ16: [39, -1],
  MRZ17: [16, -5],
  MRZ21: [25, 14],
  MRZ22: [35, 16],
  MRZ23: [44, 10],
  MRZ27: [2, 26],
  MRZ28: [17, 21],
  MRZ32: [5, 44],
  MRZ33: [13, 37],
  MRZ34: [22, 31],
  MRZ35: [49, 20],
} as const;

export type StarbasesKey = keyof typeof Starbases;
export type StarbasesType = (typeof Starbases)[keyof typeof Starbases];

export const findStarbaseNameByCoords = (coords: [number, number]) => {
  for (const [key, value] of Object.entries(Starbases)) {
    if (value[0] === coords[0] && value[1] === coords[1]) {
      return key;
    }
  }
  return;
};
