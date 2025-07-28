import {
    AsyncEventHandlerObject,
    AsyncEventObject,
    SyncEventHandlerObject,
    SyncEventObject,
} from "./types";

export interface AsyncHandlerOptions<TArgs extends unknown[], TResult = void> {
    before?: Array<AsyncEventHandlerObject<unknown[], unknown>>;
    after?: Array<AsyncEventHandlerObject<unknown[], unknown>>;
}

export function asyncHandler<TArgs extends unknown[], TResult = void>(
    handler: (
        e: AsyncEventObject,
        ...args: TArgs
    ) => Promise<TResult> | TResult,
    options: AsyncHandlerOptions<TArgs, TResult> = {},
): AsyncEventHandlerObject<TArgs, TResult> {
    return {
        handler: handler,
        ...options,
    };
}

export interface SyncHandlerOptions<TArgs extends unknown[], TResult = void> {
    before?: Array<SyncEventHandlerObject<unknown[], unknown>>;
    after?: Array<SyncEventHandlerObject<unknown[], unknown>>;
}
export function syncHandler<TArgs extends unknown[], TResult = void>(
    handler: (e: SyncEventObject, ...args: TArgs) => TResult,
    options: SyncHandlerOptions<TArgs, TResult> = {},
): SyncEventHandlerObject<TArgs, TResult> {
    return {
        handler: handler,
        ...options,
    };
}
