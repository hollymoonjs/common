import async from "./async";
import sync from "./sync";
import toEmitter from "./toEmitter";
import toHandlers from "./toHandlers";
import { asyncHandler, syncHandler } from "./eventHandler";

export const events = {
    async,
    sync,
    asyncHandler,
    syncHandler,
    toHandlers,
    toEmitter,
};

export * from "./types";
export * from "./async";
export * from "./sync";
export * from "./toHandlers";
export * from "./toEmitter";
