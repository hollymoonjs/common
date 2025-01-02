import { AsyncEventEmitter, SyncEventEmitter } from "./types";

function toEmitter<TArgs extends unknown[]>(
    event: SyncEventEmitter<TArgs>,
): SyncEventEmitter<TArgs>;
function toEmitter<TArgs extends unknown[]>(
    event: AsyncEventEmitter<TArgs>,
): AsyncEventEmitter<TArgs>;
function toEmitter(
    event: AsyncEventEmitter<unknown[]> | SyncEventEmitter<unknown[]>,
): AsyncEventEmitter<unknown[]> | SyncEventEmitter<unknown[]> {
    return {
        emit: event.emit,
    };
}

export default toEmitter;
