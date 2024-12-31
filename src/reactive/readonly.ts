import { ReadableReactive } from "./types";

function readonly<TCurrent>(
    reactive: ReadableReactive<TCurrent>,
): ReadableReactive<TCurrent> {
    return {
        onChange: reactive.onChange,
        get value() {
            return reactive.value;
        },
    };
}

export default readonly;
