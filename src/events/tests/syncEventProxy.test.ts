import { describe, expect, it, vitest } from "vitest";
import { events } from "..";
import { syncEventProxy } from "../syncEventProxy";

function createTestProxy() {
    const event = events.sync<[number]>();
    const proxy = syncEventProxy(event, {
        listenerArgs: (value) => [value + 1],
        emitArgs: (newValue) => [newValue - 1],
    });

    return { event, proxy };
}

describe("events > syncEventProxy", () => {
    it("should emit callback with correct args", () => {
        const { event, proxy } = createTestProxy();
        const cb = vitest.fn();
        proxy.on(cb);

        event.emit(1);

        expect(cb).toHaveBeenCalledWith(2);
    });

    it("should remove listener", () => {
        const { event, proxy } = createTestProxy();
        const cb = vitest.fn();
        proxy.on(cb);
        proxy.off(cb);

        event.emit(1);

        expect(cb).not.toHaveBeenCalled();
    });

    it("should transform emit args", () => {
        const { event, proxy } = createTestProxy();
        const cb = vitest.fn();
        event.on(cb);

        proxy.emit(1);

        expect(cb).toHaveBeenCalledWith(0);
    });

    it("should emit itself", () => {
        const { proxy } = createTestProxy();
        const cb = vitest.fn();
        proxy.on(cb);

        proxy.emit(1);

        expect(cb).toHaveBeenCalledWith(1);
    });
});
