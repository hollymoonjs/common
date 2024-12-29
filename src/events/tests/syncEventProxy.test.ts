import { describe, expect, it, vitest } from "vitest";
import { SyncEvent } from "..";
import { syncEventProxy } from "../syncEventProxy";

function createTestProxy() {
    const event = new SyncEvent<[number]>();
    const proxy = syncEventProxy(event, {
        listenerArgs: (value) => [value + 1],
        fireArgs: (newValue) => [newValue - 1],
    });

    return { event, proxy };
}

describe("events > syncEventProxy", () => {
    it("should fire callback with correct args", () => {
        const { event, proxy } = createTestProxy();
        const cb = vitest.fn();
        proxy.addEventListener(cb);

        event.fire(1);

        expect(cb).toHaveBeenCalledWith(2);
    });

    it("should remove listener", () => {
        const { event, proxy } = createTestProxy();
        const cb = vitest.fn();
        proxy.addEventListener(cb);
        proxy.removeEventListener(cb);

        event.fire(1);

        expect(cb).not.toHaveBeenCalled();
    });

    it("should transform fire args", () => {
        const { event, proxy } = createTestProxy();
        const cb = vitest.fn();
        event.addEventListener(cb);

        proxy.fire(1);

        expect(cb).toHaveBeenCalledWith(0);
    });

    it("should fire itself", () => {
        const { proxy } = createTestProxy();
        const cb = vitest.fn();
        proxy.addEventListener(cb);

        proxy.fire(1);

        expect(cb).toHaveBeenCalledWith(1);
    });
});
