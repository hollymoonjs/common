import { describe, it, expect, vi } from "vitest";
import { MiddlewareQueue } from "../middlewareQueue";
import { Middleware } from "../types";

describe("MiddlewareQueue", () => {
    it("executes middlewares in the order they are added", async () => {
        const queue = new MiddlewareQueue<[string]>();
        const results: string[] = [];

        const mw1: Middleware<[string]> = async (_, arg) => {
            results.push(`mw1_${arg}`);
        };
        const mw2: Middleware<[string]> = async (_, arg) => {
            results.push(`mw2_${arg}`);
        };

        queue.add(mw1);
        queue.add(mw2);
        await queue.emit("test");
        expect(results).toEqual(["mw1_test", "mw2_test"]);
    });

    it("executes middlewares in the order they are added with dependencies", async () => {
        const queue = new MiddlewareQueue<[string]>();
        const results: string[] = [];

        const mw1: Middleware<[string]> = async (_, arg) => {
            results.push(`mw1_${arg}`);
        };
        const mw2: Middleware<[string]> = async (_, arg) => {
            results.push(`mw2_${arg}`);
        };
        const mw3: Middleware<[string]> = async (_, arg) => {
            results.push(`mw3_${arg}`);
        };

        queue.add(mw3, { dependsOn: [mw2] });
        queue.add(mw2, { dependsOn: [mw1] });
        queue.add(mw1);
        await queue.emit("test");
        expect(results).toEqual(["mw1_test", "mw2_test", "mw3_test"]);
    });

    it("can stop execution with event.stop()", async () => {
        const queue = new MiddlewareQueue<[string]>();
        const results: string[] = [];

        const mw1: Middleware<[string]> = async (evt, arg) => {
            results.push(`mw1_${arg}`);
            evt.stop();
        };
        const mw2: Middleware<[string]> = async (_, arg) => {
            results.push(`mw2_${arg}`);
        };

        queue.add(mw1);
        queue.add(mw2);
        await queue.emit("test");
        expect(results).toEqual(["mw1_test"]);
    });

    it("removes a middleware correctly", async () => {
        const queue = new MiddlewareQueue<[string]>();
        const mw = vi.fn();

        queue.add(mw);
        queue.remove(mw);
        await queue.emit("test");
        expect(mw).not.toHaveBeenCalled();
    });
});
