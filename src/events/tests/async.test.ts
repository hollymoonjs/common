import { describe, it, expect } from "vitest";
import async from "../async";

describe("asyncEvent", () => {
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
