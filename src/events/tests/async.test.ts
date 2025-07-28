import { describe, it, expect, vi } from "vitest";
import async from "../async";
import { asyncHandler } from "../eventHandler";

describe("asyncEvent", () => {
    describe("callback", () => {
        it("calls handler when event is emitted", async () => {
            const event = async<[number]>();
            let result = 0;
            event.on(async (value) => {
                result = value;
            });

            await event.emit(42);
            expect(result).toBe(42);
        });

        it("removes a handler using off", async () => {
            const event = async<[number]>();
            let count = 0;
            const handler = async (val: number) => {
                count += val;
            };
            event.on(handler);
            event.off(handler);

            await event.emit(5);
            expect(count).toBe(0);
        });

        it("calls once handler only once", async () => {
            const event = async<[string]>();
            let message = "";
            event.once(async (val) => {
                message = val;
            });

            await event.emit("first");
            await event.emit("second");
            expect(message).toBe("first");
        });

        it("supports multiple handlers", async () => {
            const event = async<[number]>();
            let total = 0;
            event.on(async (val) => {
                total += val;
            });
            event.on(async (val) => {
                total += val * 2;
            });

            await event.emit(3);
            expect(total).toBe(3 + 6);
        });
    });

    describe("object", () => {
        it("calls handler when event is emitted", async () => {
            const event = async<[number]>();

            let result = 0;
            event.on(
                asyncHandler(async (_, value: number) => {
                    result = value;
                }),
            );

            await event.emit(42);
            expect(result).toBe(42);
        });

        it("removes a handler using off", async () => {
            const event = async<[number]>();
            let count = 0;
            const handler = asyncHandler(async (_, val: number) => {
                count += val;
            });
            event.on(handler);
            event.off(handler);

            await event.emit(5);
            expect(count).toBe(0);
        });

        it("calls once handler only once", async () => {
            const event = async<[string]>();
            let message = "";
            event.once(
                asyncHandler(async (_, val) => {
                    message = val;
                }),
            );

            await event.emit("first");
            await event.emit("second");
            expect(message).toBe("first");
        });

        it("supports multiple handlers", async () => {
            const event = async<[number]>();
            let total = 0;
            event.on(
                asyncHandler(async (_, val) => {
                    total += val;
                }),
            );
            event.on(
                asyncHandler(async (_, val) => {
                    total += val * 2;
                }),
            );

            await event.emit(3);
            expect(total).toBe(3 + 6);
        });

        it("respects after option", async () => {
            const event = async<[]>();
            const callback = vi.fn();

            const handler1 = asyncHandler(async () => callback("handler1"));
            const handler2 = asyncHandler(async () => callback("handler2"), {
                after: [handler1],
            });

            event.on(handler2);
            event.on(handler1);

            await event.emit();

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenNthCalledWith(1, "handler1");
            expect(callback).toHaveBeenNthCalledWith(2, "handler2");
        });

        it("respects before option", async () => {
            const event = async<[]>();
            const callback = vi.fn();

            const handler1 = asyncHandler(async () => callback("handler1"));
            const handler2 = asyncHandler(async () => callback("handler2"), {
                before: [handler1],
            });

            event.on(handler1);
            event.on(handler2);

            await event.emit();

            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenNthCalledWith(1, "handler2");
            expect(callback).toHaveBeenNthCalledWith(2, "handler1");
        });

        it("can get results from handlers", async () => {
            let result: string | null = null;

            const event = async<[]>();

            const handler1 = asyncHandler(async (e) => {
                return "handler1";
            });
            const handler2 = asyncHandler(
                async (e) => {
                    result = e.get(handler1) ?? null;
                },
                {
                    after: [handler1],
                },
            );

            event.on(handler1);
            event.on(handler2);

            await event.emit();

            expect(result).toBe("handler1");
        });
    });
});
