import { BN } from "@project-serum/anchor";
import { SectorCoordinates } from "./types";

export const StarbaseCoords: Record<string, SectorCoordinates> = {
  MUD: [new BN(0), new BN(-39)],
  MUD2: [new BN(2), new BN(-34)],
  MUD3: [new BN(10), new BN(-41)],
  MUD4: [new BN(-2), new BN(-44)],
  MUD5: [new BN(-10), new BN(-37)],
  MRZ1: [new BN(-15), new BN(-33)],
  MRZ2: [new BN(12), new BN(-31)],
  MRZ3: [new BN(-22), new BN(-25)],
  MRZ4: [new BN(-8), new BN(-24)],
  MRZ5: [new BN(2), new BN(-23)],
  MRZ6: [new BN(11), new BN(-16)],
  MRZ7: [new BN(21), new BN(-26)],
  MRZ8: [new BN(-30), new BN(-16)],
  MRZ9: [new BN(-14), new BN(-16)],
  MRZ10: [new BN(23), new BN(-12)],
  MRZ11: [new BN(31), new BN(-19)],
  MRZ12: [new BN(-16), new BN(0)],
  ONI: [new BN(-40), new BN(30)],
  ONI2: [new BN(-42), new BN(35)],
  ONI3: [new BN(-30), new BN(30)],
  ONI4: [new BN(-38), new BN(25)],
  ONI5: [new BN(-47), new BN(30)],
  MRZ13: [new BN(-36), new BN(-7)],
  MRZ14: [new BN(-23), new BN(4)],
  MRZ18: [new BN(-40), new BN(3)],
  MRZ19: [new BN(-35), new BN(12)],
  MRZ20: [new BN(-25), new BN(15)],
  MRZ24: [new BN(-45), new BN(15)],
  MRZ25: [new BN(-18), new BN(23)],
  MRZ26: [new BN(-9), new BN(24)],
  MRZ29: [new BN(-22), new BN(32)],
  MRZ30: [new BN(-19), new BN(40)],
  MRZ31: [new BN(-8), new BN(35)],
  MRZ36: [new BN(0), new BN(16)],
  Ustur: [new BN(40), new BN(30)],
  UST2: [new BN(42), new BN(35)],
  UST3: [new BN(48), new BN(32)],
  UST4: [new BN(38), new BN(25)],
  UST5: [new BN(30), new BN(28)],
  MRZ15: [new BN(22), new BN(5)],
  MRZ16: [new BN(39), new BN(-1)],
  MRZ17: [new BN(16), new BN(-5)],
  MRZ21: [new BN(25), new BN(14)],
  MRZ22: [new BN(35), new BN(16)],
  MRZ23: [new BN(44), new BN(10)],
  MRZ27: [new BN(2), new BN(26)],
  MRZ28: [new BN(17), new BN(21)],
  MRZ32: [new BN(5), new BN(44)],
  MRZ33: [new BN(13), new BN(37)],
  MRZ34: [new BN(22), new BN(31)],
  MRZ35: [new BN(49), new BN(20)],
} as const;

export type StarbaseCoordsKey = keyof typeof StarbaseCoords;
export type StarbaseCoordsType =
  (typeof StarbaseCoords)[keyof typeof StarbaseCoords];

export const findStarbaseNameByCoords = (coords: SectorCoordinates) => {
  for (const [key, value] of Object.entries(StarbaseCoords)) {
    if (value[0].eq(coords[0]) && value[1].eq(coords[1])) {
      return key as StarbaseCoordsKey;
    }
  }
  return;
};
