import { describe, expect, it, vitest } from "vitest";
import box from "../box";

describe("reactive > box", () => {
    it("should hold initial value", () => {
        const r = box(1);

        expect(r.value).toBe(1);
    });

    it("should update value", () => {
        const r = box(1);

        r.value = 2;

        expect(r.value).toBe(2);
    });

    it("should fire onChange event", () => {
        const r = box(1);
        const cb = vitest.fn();
        r.onChange.addEventListener(cb);

        r.value = 2;

        expect(cb).toHaveBeenCalledWith(2);
    });

    it("should mutate value", () => {
        const r = box(1);

        const cb = vitest.fn();
        r.onChange.addEventListener(cb);

        r.mutate((value) => value + 1);

        expect(r.value).toBe(2);
        expect(cb).toHaveBeenCalledWith(2);
    });

    it("should mutate value without return value", () => {
        const r = box<number[]>([]);

        const cb = vitest.fn();
        r.onChange.addEventListener(cb);

        r.mutate((value) => {
            value.push(1);
        });

        expect(r.value).toEqual([1]);
        expect(cb).toHaveBeenCalledWith([1]);
    });
});
