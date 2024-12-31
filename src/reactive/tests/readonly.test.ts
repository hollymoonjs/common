import { vitest, describe, expect, it } from "vitest";
import box from "../box";
import readonly from "../readonly";

const INITIAL_VALUE = 1;
const CHANGE_VALUE = 2;

describe("reactive > readonly", () => {
    function createTestDerived() {
        const boxObj = box<number>(INITIAL_VALUE);
        const derivedObj = readonly<number>(boxObj);

        return { boxObj, derivedObj };
    }

    it("should hold initial value", () => {
        const { derivedObj } = createTestDerived();

        expect(derivedObj.value).toBe(INITIAL_VALUE);
    });

    it("should trigger onChange when reactive value changes", () => {
        const { boxObj, derivedObj } = createTestDerived();

        const onChangeHandler = vitest.fn();
        derivedObj.onChange.addEventListener(onChangeHandler);

        boxObj.value = CHANGE_VALUE;

        expect(onChangeHandler).toHaveBeenCalledWith(CHANGE_VALUE);
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
