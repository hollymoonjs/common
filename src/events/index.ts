import async from "./async";
import sync from "./sync";
import toEmitter from "./toEmitter";
import toHandlers from "./toHandlers";

export const events = {
    async,
    sync,
    toHandlers,
    toEmitter,
};

export * from "./types";
export * from "./async";
export * from "./sync";
export * from "./toHandlers";
export * from "./toEmitter";
