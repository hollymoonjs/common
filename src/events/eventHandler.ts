import {
    AsyncEventHandlerObject,
    AsyncEventObject,
    SyncEventHandlerObject,
    SyncEventObject,
} from "./types";

export interface AsyncHandlerOptions<TArgs extends unknown[], TResult = void> {
    before?: Array<AsyncEventHandlerObject<any[], any>>;
    after?: Array<AsyncEventHandlerObject<any[], any>>;
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
    before?: Array<SyncEventHandlerObject<any[], any>>;
    after?: Array<SyncEventHandlerObject<any[], any>>;
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
