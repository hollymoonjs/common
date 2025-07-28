import { describe, it, expect, vi } from "vitest";
import sync from "../sync";
import { syncHandler } from "../eventHandler";

describe("syncEvent", () => {
    describe("callback", () => {
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

    describe("object", () => {
        it("calls an event handler when emit is called", () => {
            const event = sync<[string]>();
            const callback = vi.fn();
            event.on(syncHandler(callback));

            event.emit("test");
            expect(callback).toHaveBeenCalledWith(expect.anything(), "test");
        });

        it("does not call an event handler after it is removed", () => {
            const event = sync<[number]>();
            const callback = vi.fn();
            const handler = syncHandler(callback);
            event.on(handler);
            event.off(handler);

            event.emit(123);
            expect(callback).not.toHaveBeenCalled();
        });

        it("calls once handler only once", () => {
            const event = sync<[number]>();
            const callback = vi.fn();
            event.once(syncHandler(callback));

            event.emit(1);
            event.emit(2);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(expect.anything(), 1);
        });

        it("supports multiple handlers", () => {
            const event = sync<[]>();
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            event.on(syncHandler(callback1));
            event.on(syncHandler(callback2));

            event.emit();
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it("removes only the specified handler", () => {
            const event = sync<[]>();
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            const handler1 = syncHandler(callback1);
            const handler2 = syncHandler(callback2);
            event.on(handler1);
            event.on(handler2);

            event.off(handler1);
            event.emit();
            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it("respects after option", () => {
            const event = sync<[]>();
            const callback = vi.fn();

            const handler1 = syncHandler(() => callback("handler1"));
            const handler2 = syncHandler(() => callback("handler2"), {
                after: [handler1],
            });

            event.on(handler2);
            event.on(handler1);

            event.emit();

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenNthCalledWith(1, "handler1");
            expect(callback).toHaveBeenNthCalledWith(2, "handler2");
        });

        it("respects before option", () => {
            const event = sync<[]>();
            const callback = vi.fn();

            const handler1 = syncHandler(() => callback("handler1"));
            const handler2 = syncHandler(() => callback("handler2"), {
                before: [handler1],
            });

            event.on(handler1);
            event.on(handler2);

            event.emit();

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenNthCalledWith(1, "handler2");
            expect(callback).toHaveBeenNthCalledWith(2, "handler1");
        });

        it("can get results from handlers", () => {
            let result: string | null = null;

            const event = sync<[]>();

            const handler1 = syncHandler((e) => {
                return "handler1";
            });
            const handler2 = syncHandler(
                (e) => {
                    result = e.get(handler1) ?? null;
                },
                {
                    after: [handler1],
                },
            );

            event.on(handler1);
            event.on(handler2);

            event.emit();

            expect(result).toBe("handler1");
        });
    });
});
