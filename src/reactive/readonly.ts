import { ReadableReactive } from "./types";

function readonly<TCurrent>(
    reactive: ReadableReactive<TCurrent>,
): ReadableReactive<TCurrent> {
    return {
        changeEvent: reactive.changeEvent,
        get value() {
            return reactive.value;
        },
    };
}

export default readonly;
