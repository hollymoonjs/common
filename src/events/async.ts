import {
    AsyncEventEmitter,
    AsyncEventHandlers,
    AsyncEventHandler,
} from "./types";

function async<TArgs extends unknown[]>(): AsyncEventHandlers<TArgs> &
    AsyncEventEmitter<TArgs> {
    const handlers = new Set<AsyncEventHandler<TArgs>>();

    return {
        on(handler: AsyncEventHandler<TArgs>) {
            handlers.add(handler);
        },
        off(handler: AsyncEventHandler<TArgs>) {
            handlers.delete(handler);
        },
        once(handler: AsyncEventHandler<TArgs>) {
            const off = (...args: TArgs) => {
                const result = handler(...args);
                handlers.delete(off);
                return result;
            };
            handlers.add(off);
        },
        async emit(...args: TArgs) {
            for (const handler of handlers) {
                await handler(...args);
            }
        },
    };
}

export default async;
