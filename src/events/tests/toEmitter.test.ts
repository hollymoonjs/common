import { describe, it, expect, vi } from "vitest";
import toEmitter from "../toEmitter";
import { SyncEventEmitter, AsyncEventEmitter, SyncEvent } from "../types";

describe("toEmitter", () => {
    it("should wrap a sync emitter and call emit with correct args", () => {
        const mockSync: SyncEventEmitter<[string]> = {
            emit: vi.fn(),
        };
        const wrapped = toEmitter(mockSync);

        wrapped.emit("hello");
        expect(mockSync.emit).toHaveBeenCalledWith("hello");
    });

    it("should wrap an async emitter and call emit with correct args", async () => {
        const mockAsync: AsyncEventEmitter<[number]> = {
            emit: vi.fn().mockResolvedValue(undefined),
        };
        const wrapped = toEmitter(mockAsync);

        await wrapped.emit(42);
        expect(mockAsync.emit).toHaveBeenCalledWith(42);
    });

    it("should not return handlers from the original emitter", () => {
        const mockSync: SyncEvent<[]> = {
            emit: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
            once: vi.fn(),
        };
        const result = toEmitter(mockSync);
        expect(result).not.toHaveProperty("on");
        expect(result).not.toHaveProperty("off");
        expect(result).not.toHaveProperty("once");
    });
});
