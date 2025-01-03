import { SyncEventHandler } from "../events";
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
    const listenerMap = new Map<SyncEventHandler<any>, SyncEventHandler<any>>();

    function getResult() {
        return getter(...(dependencies.map((dep) => dep.value) as any));
    }

    return {
        changeEvent: {
            on(listener) {
                function wrapper() {
                    listener(getResult());
                }

                listenerMap.set(listener, wrapper);

                for (let dependency of dependencies) {
                    dependency.changeEvent.on(wrapper);
                }
            },
            off(listener) {
                const wrapper = listenerMap.get(listener);
                if (!wrapper) return;

                for (let dependency of dependencies) {
                    dependency.changeEvent.off(wrapper);
                }
            },
            once(handler) {
                function wrapper() {
                    handler(getResult());
                    for (let dependency of dependencies) {
                        dependency.changeEvent.off(wrapper);
                    }
                }

                for (let dependency of dependencies) {
                    dependency.changeEvent.on(wrapper);
                }
            },
        },
        get value() {
            return getResult();
        },
    };
}

export default compound;
