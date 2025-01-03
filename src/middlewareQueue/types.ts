export type MiddlewareEvent = {
    get stopped(): boolean;
    stop(): void;
};

export type Middleware<T extends unknown[]> = (
    event: MiddlewareEvent,
    ...eventArgs: T
) => void | Promise<void>;
