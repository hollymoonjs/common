import { RegistryKey } from "./key";

export interface Registry {
    set<T>(key: RegistryKey<T>, value: T): void;
    get<T>(key: RegistryKey<T>): T | null;
    delete<T>(key: RegistryKey<T>): void;
    has<T>(key: RegistryKey<T>): boolean;
}

export function createRegistry(): Registry {
    const map = new Map<RegistryKey<unknown>, any>();

    return {
        set<T>(key: RegistryKey<T>, value: T) {
            map.set(key, value);
        },
        get<T>(key: RegistryKey<T>): T | null {
            return map.get(key) ?? null;
        },
        delete<T>(key: RegistryKey<T>) {
            map.delete(key);
        },
        has<T>(key: RegistryKey<T>): boolean {
            return map.has(key);
        },
    };
}
