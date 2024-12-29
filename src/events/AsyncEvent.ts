export type AsyncListener<T extends unknown[]> = (
    ...eventArgs: T
) => void | Promise<void>;

export class AsyncEvent<T extends unknown[]> {
    private listeners: Array<AsyncListener<T>> = [];

    addEventListener(listener: AsyncListener<T>) {
        this.listeners.push(listener);
    }

    removeEventListener(listener: AsyncListener<T>) {
        const index = this.listeners.indexOf(listener);

        if (index === -1) {
            return;
        }

        this.listeners.splice(index, 1);
    }

    async fire(...eventArgs: T) {
        for (const listener of this.listeners) {
            await listener(...eventArgs);
        }
    }
}
