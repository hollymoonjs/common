import { describe, expect, it, vitest } from "vitest";
import box from "../box";
import compound from "../compound";

describe("reactive > compound", () => {
    it("should hold initial value", () => {
        const dep1 = box(false);
        const dep2 = box(5);

        const r = compound([dep1, dep2], (val1, val2) => {
            return val1 ? `${val2}` : "-";
        });

        expect(r.value).toBe("-");
    });

    it("should update value when dependencies change", () => {
        const dep1 = box(false);
        const dep2 = box(5);

        const r = compound([dep1, dep2], (val1, val2) => {
            return val1 ? `${val2}` : "-";
        });

        expect(r.value).toBe("-");

        dep1.value = true;
        expect(r.value).toBe("5");

        dep2.value = 10;
        expect(r.value).toBe("10");
    });

    it("should handle multiple dependencies correctly", () => {
        const dep1 = box("foo");
        const dep2 = box("bar");
        const dep3 = box(42);

        const r = compound([dep1, dep2, dep3], (v1, v2, v3) => {
            return `${v1}-${v2}-${v3}`;
        });

        expect(r.value).toBe("foo-bar-42");

        dep2.value = "baz";
        expect(r.value).toBe("foo-baz-42");
    });

    it("should fire changeEvent when dependencies change", () => {
        const dep1 = box(false);
        const dep2 = box(5);

        const r = compound([dep1, dep2], (val1, val2) => {
            return val1 ? `${val2}` : "-";
        });

        const cb = vitest.fn();
        r.changeEvent.on(cb);

        dep1.value = true;
        expect(cb).toHaveBeenLastCalledWith("5");

        dep2.value = 10;
        expect(cb).toHaveBeenLastCalledWith("10");

        expect(cb).toHaveBeenCalledTimes(2);
    });

    it("should handle changeEvent.off correctly", () => {
        const dep1 = box(false);
        const dep2 = box(5);

        const r = compound([dep1, dep2], (val1, val2) => {
            return val1 ? `${val2}` : "-";
        });

        const cb = vitest.fn();
        r.changeEvent.on(cb);

        dep1.value = true;
        dep2.value = 10;

        r.changeEvent.off(cb);

        dep1.value = false;
        dep2.value = 5;

        expect(cb).toHaveBeenCalledTimes(2);
    });

    it("should fire changeEvent.once only once", () => {
        const dep1 = box(false);
        const dep2 = box(5);

        const r = compound([dep1, dep2], (val1, val2) => {
            return val1 ? `${val2}` : "-";
        });

        const cb = vitest.fn();
        r.changeEvent.once(cb);

        dep1.value = true;
        dep2.value = 10;

        expect(cb).toHaveBeenCalledWith("5");
        expect(cb).toHaveBeenCalledTimes(1);
    });
});
