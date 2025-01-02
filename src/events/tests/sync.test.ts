import { describe, it, expect, vi } from "vitest";
import sync from "../sync";

describe("syncEvent", () => {
    it("calls an event handler when emit is called", () => {
        const event = sync<[string]>();
        const handler = vi.fn();
        event.on(handler);

        event.emit("test");
        expect(handler).toHaveBeenCalledWith("test");
    });

    it("does not call an event handler after it is removed", () => {
        const event = sync<[number]>();
        const handler = vi.fn();
        event.on(handler);
        event.off(handler);

        event.emit(123);
        expect(handler).not.toHaveBeenCalled();
    });

    it("calls once handler only once", () => {
        const event = sync<[number]>();
        const handler = vi.fn();
        event.once(handler);

        event.emit(1);
        event.emit(2);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(1);
    });

    it("supports multiple handlers", () => {
        const event = sync<[]>();
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        event.on(handler1);
        event.on(handler2);

        event.emit();
        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });

    it("removes only the specified handler", () => {
        const event = sync<[]>();
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        event.on(handler1);
        event.on(handler2);

        event.off(handler1);
        event.emit();
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });
});
