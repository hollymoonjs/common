import { DependencyGraph } from "../dependencyGraph";
import {
    AsyncEventEmitter,
    AsyncEventHandlers,
    AsyncEventHandler,
    AsyncEventHandlerObject,
    AsyncEventObject,
} from "./types";

interface EventResult<T> {
    key: AsyncEventHandler<any[], T>;
    value: T;
}

function async<TArgs extends unknown[]>(): AsyncEventHandlers<TArgs> &
    AsyncEventEmitter<TArgs> {
    const handlerKeys = new WeakMap<
        AsyncEventHandler<any[], unknown>,
        Symbol
    >();

    function getKey(handler: AsyncEventHandler<any[], unknown>) {
        if (!handlerKeys.has(handler)) {
            handlerKeys.set(handler, Symbol());
        }
        return handlerKeys.get(handler)!;
    }

    const handlerGraph = new DependencyGraph<
        Symbol,
        AsyncEventHandler<TArgs, unknown>
    >();

    return {
        on<TResult = void>(handler: AsyncEventHandler<TArgs, TResult>) {
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
        off<TResult = void>(handler: AsyncEventHandler<TArgs, TResult>) {
            const key = getKey(handler);
            handlerGraph.remove(key);
        },
        once<TResult = void>(handler: AsyncEventHandler<TArgs, TResult>) {
            const key = getKey(handler);

            if (typeof handler === "function") {
                const off = (...args: TArgs) => {
                    const result = handler(...args);
                    handlerGraph.remove(key);
                    return result;
                };
                handlerGraph.append(key, off);
            } else {
                const off: AsyncEventHandlerObject<TArgs, TResult> = {
                    ...handler,
                    handler: (e: AsyncEventObject, ...args: TArgs) => {
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
        async emit(...args: TArgs) {
            const results: EventResult<unknown>[] = [];
            const e: AsyncEventObject = {
                get: <T>(key: AsyncEventHandler<unknown[], T>) => {
                    const result = results.find((r) => r.key === key);
                    if (!result) {
                        return undefined;
                    }

                    return result.value as T;
                },
            };

            for (const handler of handlerGraph.nodes) {
                if (typeof handler === "function") {
                    await handler(...args);
                } else {
                    const value = await handler.handler(e, ...args);
                    results.push({ key: handler, value });
                }
            }
        },
    };
}

export default async;
