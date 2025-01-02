import { events } from "../events";
import { ReactiveMutator, Reactive } from "./types";

function box<T>(initial: T): Reactive<T> {
    let _value = initial;
    const onChange = events.sync<[T]>();

    return {
        changeEvent: onChange,
        get value() {
            return _value;
        },
        set value(value: T) {
            _value = value;
            onChange.emit(value);
        },
        mutate(mutator: ReactiveMutator<T>) {
            const result = mutator(_value);
            if (result !== undefined) {
                _value = result;
            }
            onChange.emit(_value);
        },
    };
}

export default box;
