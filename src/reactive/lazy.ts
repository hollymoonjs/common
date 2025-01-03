import { Reactive, ReadableReactive, WriteableReactive } from "./types";

type AnyReactive<T> = Reactive<T> | ReadableReactive<T> | WriteableReactive<T>;

function lazy<T>(init: () => Reactive<T>): Reactive<T>;
function lazy<T>(init: () => ReadableReactive<T>): ReadableReactive<T>;
function lazy<T>(init: () => WriteableReactive<T>): WriteableReactive<T>;
function lazy<T>(reactive: () => AnyReactive<T>): AnyReactive<T> {
    let _reactive:
        | Reactive<T>
        | ReadableReactive<T>
        | WriteableReactive<T>
        | null = null;

    function getReactive() {
        if (_reactive === null) {
            _reactive = reactive();
        }
        return _reactive;
    }

    return new Proxy({} as AnyReactive<T>, {
        get(_, prop) {
            let reactive = getReactive();

            return Reflect.get(reactive, prop);
        },
        set(_, prop, value) {
            let reactive = getReactive();

            return Reflect.set(reactive, prop, value);
        },
        has(target, p) {
            let reactive = getReactive();

            return Reflect.has(reactive, p);
        },
        ownKeys(target) {
            let reactive = getReactive();

            return Reflect.ownKeys(reactive);
        },
        getPrototypeOf(target) {
            let reactive = getReactive();

            return Reflect.getPrototypeOf(reactive);
        },
        setPrototypeOf(target, v) {
            let reactive = getReactive();

            return Reflect.setPrototypeOf(reactive, v);
        },
        isExtensible(target) {
            let reactive = getReactive();

            return Reflect.isExtensible(reactive);
        },
        preventExtensions(target) {
            let reactive = getReactive();

            return Reflect.preventExtensions(reactive);
        },
        getOwnPropertyDescriptor(target, p) {
            let reactive = getReactive();

            return Reflect.getOwnPropertyDescriptor(reactive, p);
        },
        defineProperty(target, p, attributes) {
            let reactive = getReactive();

            return Reflect.defineProperty(reactive, p, attributes);
        },
        deleteProperty(target, p) {
            let reactive = getReactive();

            return Reflect.deleteProperty(reactive, p);
        },
    });
}

export default lazy;
