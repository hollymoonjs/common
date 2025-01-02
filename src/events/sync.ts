import { SyncEventEmitter, SyncEventHandlers, SyncEventHandler } from "./types";

function sync<TArgs extends unknown[]>(): SyncEventHandlers<TArgs> &
    SyncEventEmitter<TArgs> {
    const handlers = new Set<SyncEventHandler<TArgs>>();

    return {
        on(handler: SyncEventHandler<TArgs>) {
            handlers.add(handler);
        },
        off(handler: SyncEventHandler<TArgs>) {
            handlers.delete(handler);
        },
        once(handler: SyncEventHandler<TArgs>) {
            const off = (...args: TArgs) => {
                const result = handler(...args);
                handlers.delete(off);
                return result;
            };
            handlers.add(off);
        },
        emit(...args: TArgs) {
            for (const handler of handlers) {
                handler(...args);
            }
        },
    };
}

export default sync;
