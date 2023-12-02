export const Resources = {
  Food: "food",
  Fuel: "fuel",
  Ammo: "ammo",
  Tool: "tool",
  Arco: "arco",
  Biomass: "biomass",
  Carbon: "carbon",
  Diamond: "diamond",
  Hydrogen: "hydrogen",
  IronOre: "iron_ore",
  CopperOre: "copper_ore",
  Lumanite: "lumanite",
  Rochinol: "rochinol",
  Sdu: "sdu",
};

export type ResourcesKey = keyof typeof Resources;
export type ResourcesType = (typeof Resources)[keyof typeof Resources];
