export type MiddlewareEvent = {
    stop(): void;
};

export type Middleware<T extends unknown[]> = (
    event: MiddlewareEvent,
    ...eventArgs: T
) => void | Promise<void>;
