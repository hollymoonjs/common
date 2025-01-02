export type SyncEventHandler<TArgs extends unknown[]> = (
    ...args: TArgs
) => void;
export type SyncEventHandlers<TArgs extends unknown[]> = {
    on(handler: SyncEventHandler<TArgs>): void;
    off(handler: SyncEventHandler<TArgs>): void;
    once(handler: SyncEventHandler<TArgs>): void;
};
export type SyncEventEmitter<TArgs extends unknown[]> = {
    emit(...args: TArgs): void;
};
export type SyncEvent<TArgs extends unknown[]> = SyncEventHandlers<TArgs> &
    SyncEventEmitter<TArgs>;

export type AsyncEventHandler<TArgs extends unknown[]> = (
    ...args: TArgs
) => Promise<void>;
export type AsyncEventHandlers<TArgs extends unknown[]> = {
    on(handler: AsyncEventHandler<TArgs>): void;
    off(handler: AsyncEventHandler<TArgs>): void;
    once(handler: AsyncEventHandler<TArgs>): void;
};
export type AsyncEventEmitter<TArgs extends unknown[]> = {
    emit(...args: TArgs): Promise<void>;
};
export type AsyncEvent<TArgs extends unknown[]> = AsyncEventHandlers<TArgs> &
    AsyncEventEmitter<TArgs>;
