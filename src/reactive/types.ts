import { SyncEventHandlers } from "../events";

export type ReactiveMutator<T> = (value: T) => T | void;

export interface ReadableReactive<T> {
    get value(): T;
    changeEvent: SyncEventHandlers<[T]>;
}

export interface WriteableReactive<T> {
    set value(value: T);
    mutate(mutator: ReactiveMutator<T>): void;
}

export type Reactive<T> = ReadableReactive<T> & WriteableReactive<T>;
