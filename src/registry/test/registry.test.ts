import { describe, expect, it } from "vitest";
import { createRegistry } from "../registry";
import { createKey } from "../key";

describe("Registry", () => {
    it("should store and retrieve values by key", () => {
        const map = createRegistry();
        const key1 = createKey<number>();
        const key2 = createKey<string>();

        map.set(key1, 42);
        map.set(key2, "hello");

        expect(map.get(key1)).toBe(42);
        expect(map.get(key2)).toBe("hello");
    });
});
