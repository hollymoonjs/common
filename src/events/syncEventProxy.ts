import { SyncEvent, SyncListener } from ".";

export type SyncEventProxyOptions<
    TCurrent extends any[],
    TNew extends any[],
> = {
    listenerArgs(...value: TCurrent): TNew;
    fireArgs(...newValue: TNew): TCurrent;
};

export function syncEventProxy<TCurrent extends any[], TNew extends any[]>(
    targetEvent: SyncEvent<TCurrent>,
    options: SyncEventProxyOptions<TCurrent, TNew>,
): SyncEvent<TNew> {
    let listenerMap = new WeakMap<SyncListener<TNew>, SyncListener<TCurrent>>();

    function addEventListener(listener: SyncListener<TNew>) {
        const newListener = (...args: TCurrent) => {
            listener(...options.listenerArgs(...args));
        };

        listenerMap.set(listener, newListener);

        return targetEvent.addEventListener(newListener);
    }
    function removeEventListener(listener: SyncListener<TNew>) {
        const newListener = listenerMap.get(listener);
        if (newListener) {
            listenerMap.delete(listener);
            targetEvent.removeEventListener(newListener);
        }
    }
    function fire(...args: TNew) {
        targetEvent.fire(...options.fireArgs(...args));
    }

    return new Proxy(targetEvent, {
        get(target, p, receiver) {
            if (p === "addEventListener") {
                return addEventListener;
            } else if (p === "removeEventListener") {
                return removeEventListener;
            } else if (p === "fire") {
                return fire;
            } else {
                return Reflect.get(target, p, receiver);
            }
        },
    }) as unknown as SyncEvent<TNew>;
}
