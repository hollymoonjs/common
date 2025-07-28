import { DependencyGraph } from "../dependencyGraph";
import {
    SyncEventEmitter,
    SyncEventHandlers,
    SyncEventHandler,
    SyncEventObject,
} from "./types";

interface EventResult<T> {
    key: SyncEventHandler<any[], T>;
    value: T;
}

function sync<TArgs extends unknown[]>(): SyncEventHandlers<TArgs> &
    SyncEventEmitter<TArgs> {
    const handlerKeys = new WeakMap<SyncEventHandler<any[], unknown>, Symbol>();

    function getKey(handler: SyncEventHandler<any[], unknown>) {
        if (!handlerKeys.has(handler)) {
            handlerKeys.set(handler, Symbol());
        }
        return handlerKeys.get(handler)!;
    }

    const handlerGraph = new DependencyGraph<
        Symbol,
        SyncEventHandler<TArgs, unknown>
    >();

    return {
        on<TResult = void>(handler: SyncEventHandler<TArgs, TResult>) {
            const key = getKey(handler);
            if (typeof handler === "function") {
                handlerGraph.append(key, handler);
            } else {
                handlerGraph.append(key, handler, {
                    before: (handler.before ?? []).map(getKey),
                    after: (handler.after ?? []).map(getKey),
                });
            }
        },
        off<TResult = void>(handler: SyncEventHandler<TArgs, TResult>) {
            const key = getKey(handler);
            handlerGraph.remove(key);
        },
        once<TResult = void>(handler: SyncEventHandler<TArgs, TResult>) {
            const key = getKey(handler);
            if (typeof handler === "function") {
                const off = (...args: TArgs) => {
                    const result = handler(...args);
                    handlerGraph.remove(key);
                    return result;
                };
                handlerGraph.append(key, off);
                return;
            } else {
                const off: SyncEventHandler<TArgs, TResult> = {
                    ...handler,
                    handler: (e: SyncEventObject, ...args: TArgs) => {
                        const result = handler.handler(e, ...args);
                        handlerGraph.remove(key);
                        return result;
                    },
                };
                handlerGraph.append(key, off, {
                    before: (handler.before ?? []).map(getKey),
                    after: (handler.after ?? []).map(getKey),
                });
            }
        },
        emit(...args: TArgs) {
            const results: EventResult<unknown>[] = [];
            const e: SyncEventObject = {
                get: <T>(key: SyncEventHandler<unknown[], T>) => {
                    const result = results.find((r) => r.key === key);
                    if (!result) {
                        return undefined;
                    }
                    return result.value as T;
                },
            };

            for (const handler of handlerGraph.nodes) {
                if (typeof handler === "function") {
                    handler(...args);
                } else {
                    const value = handler.handler(e, ...args);
                    results.push({ key: handler, value });
                }
            }
        },
    };
}

export default sync;
