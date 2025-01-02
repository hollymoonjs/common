import { describe, expect, it } from "vitest";
import { DependencyGraph } from "../dependencyGraph";

describe("dependencyGraph", () => {
    it("should prepend values should be in reverse-order", () => {
        const graph = new DependencyGraph<string, string>();
        graph.prepend("a", "a");
        graph.prepend("b", "b");
        graph.prepend("c", "c");
        graph.prepend("d", "d");

        expect(graph.nodes).toEqual(["d", "c", "b", "a"]);
    });

    it("should append values should be in-order", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");
        graph.append("c", "c");
        graph.append("d", "d");

        expect(graph.nodes).toEqual(["a", "b", "c", "d"]);
    });

    it("should prepend values before the appended ones", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.prepend("b", "b");
        graph.append("c", "c");
        graph.prepend("d", "d");

        expect(graph.nodes).toEqual(["d", "b", "a", "c"]);
    });

    it("should resolve dependencies", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");
        graph.append("c", "c");
        graph.append("d", "d");
        graph.dependsOn("b", ["c"]);

        expect(graph.nodes).toEqual(["a", "c", "b", "d"]);
    });

    it("should resolve dependencies between prepended and appended values", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.prepend("b", "b");
        graph.append("c", "c");
        graph.prepend("d", "d");
        graph.dependsOn("b", ["a"]);

        expect(graph.nodes).toEqual(["d", "a", "b", "c"]);
    });

    it("should throw error when removing node with dependencies", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");
        graph.dependsOn("b", ["a"]);

        expect(() => graph.remove("a")).toThrow();
        expect(graph.get("a")).toBeDefined();
        expect(graph.get("b")).toBeDefined();
    });

    it("should remove node with dependencies when recursive option is set", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");
        graph.dependsOn("b", ["a"]);

        graph.remove("a", { recursive: true });

        expect(graph.get("a")).toBeUndefined();
        expect(graph.get("b")).toBeUndefined();
    });

    it("should throw error when circular dependencies are detected", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");
        graph.dependsOn("a", ["b"]);
        graph.dependsOn("b", ["a"]);

        expect(() => graph.nodes).toThrow();
    });

    it("should do nothing when removing a non-existent node", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.remove("b");

        expect(graph.nodes).toEqual(["a"]);
    });

    it("should handle adding the same key twice", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");

        expect(() => graph.append("a", "newA")).toThrow();
        expect(() => graph.prepend("a", "newA")).toThrow();
    });

    it("should handle an empty dependency list properly", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("x", "valueX", { dependsOn: [] });

        expect(graph.nodes).toEqual(["valueX"]);
    });
});
