import { SyncEvent } from "../events";

export type ReactiveMutator<T> = (value: T) => T;

export interface ReadableReactive<T> {
    get value(): T;
    onChange: SyncEvent<[T]>;
}

export interface WriteableReactive<T> {
    set value(value: T);
    mutate(mutator: ReactiveMutator<T>): void;
}

export type Reactive<T> = ReadableReactive<T> & WriteableReactive<T>;
