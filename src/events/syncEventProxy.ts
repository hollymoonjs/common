import {
    SyncEvent,
    SyncEventEmitter,
    SyncEventHandler,
    SyncEventHandlers,
} from "./types";

export type SyncEventProxyOptions<
    TCurrent extends any[],
    TNew extends any[],
> = {
    listenerArgs(...value: TCurrent): TNew;
    emitArgs(...newValue: TNew): TCurrent;
};

export function syncEventProxy<TCurrent extends any[], TNew extends any[]>(
    targetEvent: SyncEvent<TCurrent>,
    options: SyncEventProxyOptions<TCurrent, TNew>,
): SyncEvent<TNew>;
export function syncEventProxy<TCurrent extends any[], TNew extends any[]>(
    targetEvent: SyncEventHandlers<TCurrent>,
    options: SyncEventProxyOptions<TCurrent, TNew>,
): SyncEventHandlers<TNew>;
export function syncEventProxy<TCurrent extends any[], TNew extends any[]>(
    targetEvent: SyncEventEmitter<TCurrent>,
    options: SyncEventProxyOptions<TCurrent, TNew>,
): SyncEventEmitter<TNew>;
export function syncEventProxy<TCurrent extends any[], TNew extends any[]>(
    targetEvent:
        | SyncEventHandlers<TCurrent>
        | SyncEventEmitter<TCurrent>
        | SyncEvent<TCurrent>,
    options: SyncEventProxyOptions<TCurrent, TNew>,
): SyncEvent<TNew> | SyncEventHandlers<TNew> | SyncEventEmitter<TNew> {
    let handlerMap = new WeakMap<
        SyncEventHandler<TNew>,
        SyncEventHandler<TCurrent>
    >();

    const intercepted: Record<string, unknown> = {};

    if ("on" in targetEvent) {
        intercepted.on = function on(handler: SyncEventHandler<TNew>) {
            const newHandler = (...args: TCurrent) => {
                handler(...options.listenerArgs(...args));
            };

            handlerMap.set(handler, newHandler);

            return targetEvent.on(newHandler);
        };
    }
    if ("off" in targetEvent) {
        intercepted.off = function off(listener: SyncEventHandler<TNew>) {
            const newHandler = handlerMap.get(listener);
            if (newHandler) {
                handlerMap.delete(listener);
                targetEvent.off(newHandler);
            }
        };
    }

    if ("once" in targetEvent) {
        intercepted.once = function once(listener: SyncEventHandler<TNew>) {
            const newHandler = (...args: TCurrent) => {
                listener(...options.listenerArgs(...args));
            };

            return targetEvent.once(newHandler);
        };
    }

    if ("emit" in targetEvent) {
        intercepted.emit = function emit(...args: TNew) {
            targetEvent.emit(...options.emitArgs(...args));
        };
    }

    return new Proxy(targetEvent, {
        get(target, p, receiver) {
            if (typeof p === "string" && p in intercepted) {
                return intercepted[p];
            }
            return Reflect.get(target, p, receiver);
        },
    }) as unknown as SyncEvent<TNew>;
}
