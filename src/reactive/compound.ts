import {
    SyncEventHandler,
    SyncEventHandlerCallback,
    SyncEventObject,
} from "../events";
import { ReadableReactive } from "./types";

export type CompoundGetter<TValues extends Array<unknown>, TResult> = (
    ...values: TValues
) => TResult;

export type ReadableReactiveList<TDependencies extends Array<unknown>> = {
    [K in keyof TDependencies]: ReadableReactive<TDependencies[K]>;
};

function compound<TTypes extends Array<unknown>, TResult>(
    dependencies: ReadableReactiveList<TTypes>,
    getter: CompoundGetter<TTypes, TResult>,
): ReadableReactive<TResult> {
    const listenerMap = new Map<
        SyncEventHandler<any[], unknown>,
        SyncEventHandler<any[], unknown>
    >();

    function getResult() {
        return getter(...(dependencies.map((dep) => dep.value) as any));
    }

    return {
        changeEvent: {
            on(listener) {
                if (typeof listener === "function") {
                    function wrapper() {
                        if (!(typeof listener === "function")) {
                            return;
                        }
                        listener(getResult());
                    }

                    listenerMap.set(listener, wrapper);

                    for (let dependency of dependencies) {
                        dependency.changeEvent.on(wrapper);
                    }
                } else {
                    const wrapper = {
                        handler: (e: SyncEventObject) => {
                            listener.handler(e, getResult());
                        },
                        after: listener.after,
                        before: listener.before,
                    };

                    listenerMap.set(listener, wrapper);

                    for (let dependency of dependencies) {
                        dependency.changeEvent.on(wrapper);
                    }
                }
            },
            off(listener) {
                const wrapper = listenerMap.get(listener);
                if (!wrapper) return;

                listenerMap.delete(listener);
                for (let dependency of dependencies) {
                    dependency.changeEvent.off(wrapper);
                }
            },
            once(listener) {
                if (typeof listener === "function") {
                    function wrapper() {
                        if (!(typeof listener === "function")) {
                            return;
                        }
                        listenerMap.delete(listener);
                        for (let dependency of dependencies) {
                            dependency.changeEvent.off(wrapper);
                        }

                        listener(getResult());
                    }

                    listenerMap.set(listener, wrapper);
                    for (let dependency of dependencies) {
                        dependency.changeEvent.on(wrapper);
                    }
                } else {
                    const wrapper = {
                        handler: (e: SyncEventObject) => {
                            listenerMap.delete(listener);
                            for (let dependency of dependencies) {
                                dependency.changeEvent.off(wrapper);
                            }

                            listener.handler(e, getResult());
                        },
                        after: listener.after,
                        before: listener.before,
                    };

                    listenerMap.set(listener, wrapper);
                    for (let dependency of dependencies) {
                        dependency.changeEvent.on(wrapper);
                    }
                }
            },
        },
        get value() {
            return getResult();
        },
    };
}

export default compound;
