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

    it("should throw error when non-existent dependencies are added", () => {
        const graph = new DependencyGraph<string, string>();

        graph.append("a", "a", { dependsOn: ["b"] });

        expect(() => graph.nodes).toThrow();
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

    it("should respect soft 'after' constraints when target node exists", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("b", "b", { after: ["a"] });
        graph.append("a", "a");
        graph.append("c", "c");

        expect(graph.nodes).toEqual(["a", "b", "c"]);
    });

    it("should ignore soft 'after' constraints when target node does not exist", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b", { after: ["nonexistent"] });
        graph.append("c", "c");

        expect(graph.nodes).toEqual(["a", "b", "c"]);
    });

    it("should respect soft 'before' constraints when target node exists", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");
        graph.append("c", "c", { before: ["b"] });

        expect(graph.nodes).toEqual(["a", "c", "b"]);
    });

    it("should ignore soft 'before' constraints when target node does not exist", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b", { before: ["nonexistent"] });
        graph.append("c", "c");

        expect(graph.nodes).toEqual(["a", "b", "c"]);
    });

    it("should handle both after and before constraints together", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("b", "b");
        graph.append("c", "c", { after: ["a"], before: ["b"] });
        graph.append("a", "a");

        expect(graph.nodes).toEqual(["a", "c", "b"]);
    });

    it("should combine hard dependencies with soft constraints", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("c", "c", { dependsOn: ["a"], after: ["b"] });
        graph.append("a", "a");
        graph.append("b", "b");

        expect(graph.nodes).toEqual(["a", "b", "c"]);
    });

    it("should clean up soft constraints when removing nodes", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("b", "b", { after: ["a"] });
        graph.append("a", "a");
        graph.append("c", "c", { before: ["a"] });

        graph.remove("a");

        expect(graph.nodes).toEqual(["b", "c"]);
    });

    it("should work with prepend nodes and soft constraints", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.prepend("b", "b", { after: ["a"] });

        expect(graph.nodes).toEqual(["a", "b"]);
    });

    // Complex Circular Dependency Detection
    it("should detect circular dependencies in longer chains", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");
        graph.append("c", "c");
        graph.append("d", "d");
        graph.dependsOn("a", ["b"]);
        graph.dependsOn("b", ["c"]);
        graph.dependsOn("c", ["d"]);
        graph.dependsOn("d", ["a"]); // Creates a cycle

        expect(() => graph.nodes).toThrow("Circular dependency detected");
    });

    it("should detect self-referencing dependencies", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.dependsOn("a", ["a"]);

        expect(() => graph.nodes).toThrow("Circular dependency detected");
    });

    // Complex Multi-level Dependencies
    it("should handle multi-level dependency chains correctly", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");
        graph.append("c", "c");
        graph.append("d", "d");
        graph.append("e", "e");

        graph.dependsOn("e", ["d"]);
        graph.dependsOn("d", ["c"]);
        graph.dependsOn("c", ["b"]);
        graph.dependsOn("b", ["a"]);

        expect(graph.nodes).toEqual(["a", "b", "c", "d", "e"]);
    });

    // Mixed Constraint Types
    it("should handle conflicting soft constraints gracefully", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b", { after: ["c"], before: ["a"] }); // Impossible constraint
        graph.append("c", "c");

        // Should resolve without error, potentially prioritizing one constraint
        expect(() => graph.nodes).not.toThrow();
    });

    it("should prioritize hard dependencies over soft constraints", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b", { dependsOn: ["c"], before: ["a"] });
        graph.append("c", "c");

        // 'b' depends on 'c', so 'c' must come before 'b', regardless of 'before' constraint
        expect(graph.nodes).toEqual(["c", "b", "a"]);
    });

    // Empty Graph Edge Cases
    it("should handle empty graph", () => {
        const graph = new DependencyGraph<string, string>();
        expect(graph.nodes).toEqual([]);
    });

    it("should handle single node graph", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        expect(graph.nodes).toEqual(["a"]);
    });

    // Performance and Caching
    it("should cache resolved results", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");

        const first = graph.nodes;
        const second = graph.nodes;

        expect(first).toBe(second); // Should be the same reference (cached)
    });

    it("should invalidate cache when nodes are added", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");

        const first = graph.nodes;
        graph.append("b", "b");
        const second = graph.nodes;

        expect(first).not.toBe(second); // Should be different references
        expect(second).toEqual(["a", "b"]);
    });

    // Advanced Removal Scenarios
    it("should handle recursive removal with complex dependency chains", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");
        graph.append("c", "c");
        graph.append("d", "d");

        graph.dependsOn("b", ["a"]);
        graph.dependsOn("c", ["b"]);
        graph.dependsOn("d", ["c"]);

        graph.remove("a", { recursive: true });

        expect(graph.get("a")).toBeUndefined();
        expect(graph.get("b")).toBeUndefined();
        expect(graph.get("c")).toBeUndefined();
        expect(graph.get("d")).toBeUndefined();
    });

    it("should properly clean up dependency maps when removing nodes", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b", { dependsOn: ["a"], after: ["a"] });

        graph.remove("a", { recursive: true });

        // Verify that internal state is clean
        expect(graph.nodes).toEqual([]);
    });

    // Complex Prepend/Append Scenarios
    it("should handle complex prepend/append ordering with dependencies", () => {
        const graph = new DependencyGraph<string, string>();
        graph.prepend("z", "z");
        graph.append("a", "a");
        graph.prepend("y", "y", { dependsOn: ["a"] });
        graph.append("b", "b", { dependsOn: ["z"] });

        // Expected: a first (needed by y), then y (prepend), then z (prepend), then b (append depends on z)
        expect(graph.nodes).toEqual(["a", "y", "z", "b"]);
    });

    // Error Message Quality
    it("should provide descriptive error messages for missing dependencies", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a", { dependsOn: ["missing"] });

        expect(() => graph.nodes).toThrow("Dependency does not exist: missing");
    });

    it("should provide descriptive error messages for circular dependencies", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");
        graph.dependsOn("a", ["b"]);
        graph.dependsOn("b", ["a"]);

        expect(() => graph.nodes).toThrow(
            /Circular dependency detected involving:/,
        );
    });

    // Type Safety and Generic Behavior
    it("should work with different key and value types", () => {
        const graph = new DependencyGraph<number, { name: string }>();
        graph.append(1, { name: "first" });
        graph.append(2, { name: "second" }, { dependsOn: [1] });

        expect(graph.nodes).toEqual([{ name: "first" }, { name: "second" }]);
        expect(graph.get(1)).toEqual({ name: "first" });
    });

    // Boundary Conditions
    it("should handle moderately large dependency graphs", () => {
        const graph = new DependencyGraph<number, string>();

        // Add 100 nodes with some dependencies
        for (let i = 0; i < 100; i++) {
            const deps = i > 0 ? [i - 1] : [];
            graph.append(i, `value${i}`, { dependsOn: deps });
        }

        const result = graph.nodes;
        expect(result).toHaveLength(100);
        expect(result[0]).toBe("value0");
        expect(result[99]).toBe("value99");
    });

    // Additional edge cases
    it("should handle multiple dependencies on the same node", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b", { dependsOn: ["a"] });
        graph.append("c", "c", { dependsOn: ["a"] });
        graph.append("d", "d", { dependsOn: ["b", "c"] });

        expect(graph.nodes).toEqual(["a", "b", "c", "d"]);
    });

    it("should handle duplicate dependencies gracefully", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b");
        graph.dependsOn("b", ["a"]);
        graph.dependsOn("b", ["a"]); // Duplicate dependency

        expect(graph.nodes).toEqual(["a", "b"]);
    });

    it("should handle mixed prepend/append with complex constraints", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("middle", "middle");
        graph.prepend("first", "first", { before: ["middle"] });
        graph.append("last", "last", { after: ["middle"] });
        graph.prepend("second", "second", {
            after: ["first"],
            before: ["middle"],
        });

        const result = graph.nodes;
        expect(result.indexOf("first")).toBeLessThan(result.indexOf("second"));
        expect(result.indexOf("second")).toBeLessThan(result.indexOf("middle"));
        expect(result.indexOf("middle")).toBeLessThan(result.indexOf("last"));
    });

    it("should handle removing nodes that are part of soft constraints", () => {
        const graph = new DependencyGraph<string, string>();
        graph.append("a", "a");
        graph.append("b", "b", { after: ["a"] });
        graph.append("c", "c", { before: ["b"] });

        graph.remove("a");

        // Should still work even though 'after' constraint references removed node
        expect(graph.nodes).toEqual(["c", "b"]);
    });
});
