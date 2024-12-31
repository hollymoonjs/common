import { SyncEvent } from "../events";
import { ReactiveMutator, Reactive } from "./types";

function box<T>(initial: T): Reactive<T> {
    let _value = initial;
    const onChange = new SyncEvent<[T]>();

    return {
        onChange,
        get value() {
            return _value;
        },
        set value(value: T) {
            _value = value;
            onChange.fire(value);
        },
        mutate(mutator: ReactiveMutator<T>) {
            const result = mutator(_value);
            if (result !== undefined) {
                _value = result;
            }
            onChange.fire(_value);
        },
    };
}

export default box;
