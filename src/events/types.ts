export interface SyncEventObject {
    get<T>(key: SyncEventHandlerObject<unknown[], T>): T | undefined;
}

export type SyncEventHandlerObject<TArgs extends unknown[], TResult> = {
    handler: (e: SyncEventObject, ...args: TArgs) => TResult;
    after?: Array<SyncEventHandlerObject<any[], any>>;
    before?: Array<SyncEventHandlerObject<any[], any>>;
};

export type SyncEventHandlerCallback<TArgs extends unknown[]> = (
    ...args: TArgs
) => void;

export type SyncEventHandler<TArgs extends unknown[], TResult = void> =
    | SyncEventHandlerCallback<TArgs>
    | SyncEventHandlerObject<TArgs, TResult>;

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

export interface AsyncEventObject {
    get<T>(key: AsyncEventHandlerObject<unknown[], T>): T | undefined;
}

export type AsyncEventHandlerObject<TArgs extends unknown[], TResult> = {
    handler: (
        e: AsyncEventObject,
        ...args: TArgs
    ) => Promise<TResult> | TResult;
    after?: Array<AsyncEventHandlerObject<any[], any>>;
    before?: Array<AsyncEventHandlerObject<any[], any>>;
};

export type AsyncEventHandlerCallback<TArgs extends unknown[]> = (
    ...args: TArgs
) => Promise<void> | void;

export type AsyncEventHandler<TArgs extends unknown[], TResult = void> =
    | AsyncEventHandlerCallback<TArgs>
    | AsyncEventHandlerObject<TArgs, TResult>;

export type AsyncEventHandlers<TArgs extends unknown[]> = {
    on(handler: AsyncEventHandler<TArgs, unknown>): void;
    off(handler: AsyncEventHandler<TArgs, unknown>): void;
    once(handler: AsyncEventHandler<TArgs, unknown>): void;
};
export type AsyncEventEmitter<TArgs extends unknown[]> = {
    emit(...args: TArgs): Promise<void>;
};
export type AsyncEvent<TArgs extends unknown[]> = AsyncEventHandlers<TArgs> &
    AsyncEventEmitter<TArgs>;
