import { AsyncEventHandlers, SyncEventHandlers } from "./types";

function toHandlers<TArgs extends unknown[]>(
    event: SyncEventHandlers<TArgs>,
): SyncEventHandlers<TArgs>;
function toHandlers<TArgs extends unknown[]>(
    event: AsyncEventHandlers<TArgs>,
): AsyncEventHandlers<TArgs>;
function toHandlers(
    event: AsyncEventHandlers<unknown[]> | SyncEventHandlers<unknown[]>,
): AsyncEventHandlers<unknown[]> | SyncEventHandlers<unknown[]> {
    return {
        on: event.on,
        off: event.off,
        once: event.once,
    };
}

export default toHandlers;
