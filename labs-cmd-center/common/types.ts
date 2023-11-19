export type LabsAction<R, A extends any[]> = (...args: A) => Promise<R>;
