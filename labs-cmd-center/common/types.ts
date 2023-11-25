export type LabsAction<R, A extends any[]> = (...args: A) => Promise<R>;

export type FleetScan = {
  name: string;
  x: number;
  y: number;
  time: number;
  scanCooldown: number;
};
