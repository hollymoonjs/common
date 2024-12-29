export * from "./types";
export * from "./box";
export * from "./derived";

import box from "./box";
import derived from "./derived";

export const reactive = {
    box,
    derived,
};
