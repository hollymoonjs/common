import { createRegistry } from "./registry";
import { createKey } from "./key";

export type * from "./key";
export type * from "./registry";

export const registry = Object.assign(createRegistry, { key: createKey });
