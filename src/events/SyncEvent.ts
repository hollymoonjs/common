export type SyncListener<T extends unknown[]> = (...eventArgs: T) => void;

export class SyncEvent<T extends unknown[]> {
  private listeners: Array<SyncListener<T>> = [];

  addEventListener(listener: SyncListener<T>) {
    this.listeners.push(listener);
  }

  removeEventListener(listener: SyncListener<T>) {
    const index = this.listeners.indexOf(listener);

    if (index === -1) {
      return;
    }

    this.listeners.splice(index, 1);
  }

  fire(...eventArgs: T) {
    for (const listener of this.listeners) {
      listener(...eventArgs);
    }
  }
}
