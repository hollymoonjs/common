export interface RegistryKey<T> extends Symbol {}

export function createKey<T>(): RegistryKey<T> {
    return Symbol();
}
