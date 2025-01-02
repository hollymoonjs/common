import { describe, it, expect, vi } from "vitest";
import toHandlers from "../toHandlers";
import type {
    SyncEventHandlers,
    AsyncEventHandlers,
    SyncEvent,
} from "../types";

describe("toHandlers", () => {
    it("calls each sync handler correctly", () => {
        const sync: SyncEventHandlers<[number]> = {
            on: vi.fn(),
            off: vi.fn(),
            once: vi.fn(),
        };

        const listener = () => {};

        const handlers = toHandlers(sync);
        handlers.on(listener);
        handlers.off(listener);
        handlers.once(listener);

        expect(sync.on).toHaveBeenCalledWith(listener);
        expect(sync.off).toHaveBeenCalledWith(listener);
        expect(sync.once).toHaveBeenCalledWith(listener);
    });

    it("calls each async handler correctly", async () => {
        const async: AsyncEventHandlers<[string]> = {
            on: vi.fn(),
            off: vi.fn(),
            once: vi.fn(),
        };

        const listener = async () => {};

        const handlers = toHandlers(async);
        handlers.on(listener);
        handlers.off(listener);
        handlers.once(listener);

        expect(async.on).toHaveBeenCalledWith(listener);
        expect(async.off).toHaveBeenCalledWith(listener);
        expect(async.once).toHaveBeenCalledWith(listener);
    });

    it("should not return handlers from the original emitter", () => {
        const sync: SyncEvent<[]> = {
            on: vi.fn(),
            off: vi.fn(),
            once: vi.fn(),
            emit: vi.fn(),
        };

        const result = toHandlers(sync);
        expect(result).not.toHaveProperty("emit");
    });
});
