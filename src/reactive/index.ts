export * from "./types";
export * from "./box";
export * from "./derived";
export * from "./readonly";

import box from "./box";
import derived from "./derived";
import readonly from "./readonly";

export const reactive = {
    box,
    derived,
    readonly,
};
