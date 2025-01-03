export * from "./types";
export * from "./box";
export * from "./derived";
export * from "./readonly";

import box from "./box";
import compound from "./compound";
import derived from "./derived";
import lazy from "./lazy";
import readonly from "./readonly";

export const reactive = {
    box,
    derived,
    readonly,
    lazy,
    compound,
};
