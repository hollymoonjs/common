import { vitest, describe, expect, it } from "vitest";
import box from "../box";
import derived from "../derived";

const INITIAL_VALUE = 1;
const CHANGE_VALUE = 2;
const DELTA = 1;

describe("reactive > derived", () => {
    describe("read-only", () => {
        function createTestDerived() {
            const boxObj = box<number>(INITIAL_VALUE);
            const derivedObj = derived<number, number>(boxObj, {
                get: (value) => value + DELTA,
            });

            return { boxObj, derivedObj };
        }

        it("should hold initial value", () => {
            const { derivedObj } = createTestDerived();

            expect(derivedObj.value).toBe(INITIAL_VALUE + DELTA);
        });

        it("should trigger onChange when reactive value changes", () => {
            const { boxObj, derivedObj } = createTestDerived();

            const onChangeHandler = vitest.fn();
            derivedObj.changeEvent.on(onChangeHandler);

            boxObj.value = CHANGE_VALUE;

            expect(onChangeHandler).toHaveBeenCalledWith(CHANGE_VALUE + DELTA);
        });

        it("should throw error when trying to set value", () => {
            const { derivedObj } = createTestDerived();

            expect(() => {
                (derivedObj as any).value = 3;
            }).toThrowError();
        });

        it("should not have mutate function", () => {
            const { derivedObj } = createTestDerived();

            expect((derivedObj as any).mutate).toBeUndefined();
        });
    });

    describe("read-write", () => {
        function createTestDerived() {
            const boxObj = box<number>(INITIAL_VALUE);
            const derivedObj = derived<number, number>(boxObj, {
                get: (value) => value + DELTA,
                set: (value: number) => value - DELTA,
            });

            return { boxObj, derivedObj };
        }

        it("should hold initial value", () => {
            const { derivedObj } = createTestDerived();

            expect(derivedObj.value).toBe(2);
        });

        it("should trigger onChange when reactive value changes", () => {
            const { boxObj, derivedObj } = createTestDerived();

            const onChangeHandler = vitest.fn();
            derivedObj.changeEvent.on(onChangeHandler);

            boxObj.value = 2;

            expect(onChangeHandler).toHaveBeenCalled();
        });

        it("should update value", () => {
            const { boxObj, derivedObj } = createTestDerived();

            derivedObj.value = 3;

            expect(boxObj.value).toBe(2);
        });

        it("should mutate value correctly", () => {
            const { boxObj, derivedObj } = createTestDerived();

            derivedObj.mutate((value) => value + 1);

            expect(boxObj.value).toBe(2);
        });

        it("should trigger onChange when value is mutated", () => {
            const { derivedObj } = createTestDerived();

            const onChangeHandler = vitest.fn();
            derivedObj.changeEvent.on(onChangeHandler);

            derivedObj.mutate((value) => value + 1);

            expect(onChangeHandler).toHaveBeenCalledWith(3);
        });
    });
});
