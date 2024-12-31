import { syncEventProxy } from "../events/syncEventProxy";
import { Reactive, ReadableReactive } from "./types";

export type DerivedGetter<TCurrent, TNew> = (currentValue: TCurrent) => TNew;

export type ReadOnlyDerivedOptions<TCurrent, TNew> = {
    get: DerivedGetter<TCurrent, TNew>;
};

export type DerivedOptions<TCurrent, TNew> = ReadOnlyDerivedOptions<
    TCurrent,
    TNew
> & {
    set(newValue: TNew): TCurrent;
};

function derived<TCurrent, TNew>(
    reactive: ReadableReactive<TCurrent>,
    options:
        | ReadOnlyDerivedOptions<TCurrent, TNew>
        | DerivedGetter<TCurrent, TNew>,
): ReadableReactive<TNew>;
function derived<TCurrent, TNew>(
    reactive: Reactive<TCurrent>,
    options: DerivedOptions<TCurrent, TNew>,
): Reactive<TNew>;
function derived<TCurrent, TNew>(
    reactive: ReadableReactive<TCurrent> | Reactive<TCurrent>,
    options:
        | ReadOnlyDerivedOptions<TCurrent, TNew>
        | DerivedOptions<TCurrent, TNew>
        | DerivedGetter<TCurrent, TNew>,
): ReadableReactive<TNew> | Reactive<TNew> {
    if (typeof options === "function") {
        options = { get: options };
    }

    const onChange = syncEventProxy<[TCurrent], [TNew]>(reactive.onChange, {
        listenerArgs: (value) => [options.get(value)],
        fireArgs: (newValue) => {
            if ("set" in options) {
                return [options.set(newValue)];
            }
            throw new Error("Cannot set value of read-only derived value");
        },
    });

    if ("set" in options) {
        const _reactive = reactive as Reactive<TCurrent>;
        return {
            onChange,
            get value() {
                return options.get(reactive.value);
            },
            set value(value: TNew) {
                _reactive.value = options.set(value);
            },
            mutate(mutator) {
                _reactive.mutate((value) => {
                    const newValue = options.get(value);
                    const mutatedValue = mutator(newValue);
                    if (mutatedValue === undefined) {
                        return options.set(newValue);
                    }
                    return options.set(mutatedValue);
                });
            },
        } as Reactive<TNew>;
    } else {
        return {
            onChange,
            get value() {
                return options.get(reactive.value);
            },
        };
    }
}

export default derived;
