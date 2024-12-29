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
            _value = mutator(_value);
            onChange.fire(_value);
        },
    };
}

export default box;
