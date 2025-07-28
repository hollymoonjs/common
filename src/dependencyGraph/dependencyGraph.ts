import { DependencyGraphError } from "./error";

interface Node<TKey, TValue> {
    key: TKey;
    value: TValue;
    position: "prepend" | "append";
}

export interface AddOptions<TKey> {
    dependsOn?: TKey[];
    after?: TKey[];
    before?: TKey[];
}

export interface RemoveOptions {
    recursive?: boolean;
}

export class DependencyGraph<TKey, TValue> {
    private _nodes: Node<TKey, TValue>[] = [];
    private _requires: Map<TKey, TKey[]> = new Map();
    private _dependencies: Map<TKey, TKey[]> = new Map();

    private resolved: TValue[] | null = null;

    append(key: TKey, value: TValue, options?: AddOptions<TKey>) {
        if (this._nodes.some((node) => node.key === key)) {
            throw new DependencyGraphError(`Node already exists: ${key}`);
        }

        this.resolved = null;

        this._nodes.push({ key, value, position: "append" });
        this.dependsOn(key, options?.dependsOn ?? []);
        this.before(key, options?.before ?? []);
        this.after(key, options?.after ?? []);
    }

    prepend(key: TKey, value: TValue, options?: AddOptions<TKey>) {
        if (this._nodes.some((node) => node.key === key)) {
            throw new DependencyGraphError(`Node already exists: ${key}`);
        }

        this.resolved = null;

        this._nodes.push({ key, value, position: "prepend" });
        this.dependsOn(key, options?.dependsOn ?? []);
        this.before(key, options?.before ?? []);
        this.after(key, options?.after ?? []);
    }

    remove(key: TKey, options?: RemoveOptions) {
        this.resolved = null;

        const requiredNodes = [...this._requires.entries()].filter(
            ([_, requires]) => requires.includes(key),
        );

        if (options?.recursive) {
            for (const [requiredNode] of requiredNodes) {
                this.remove(requiredNode, options);
            }
        } else if (requiredNodes.length > 0) {
            throw new DependencyGraphError(
                `Cannot remove node with dependencies: ${key}`,
            );
        }

        const index = this._nodes.findIndex((node) => node.key === key);
        if (index !== -1) {
            this._nodes.splice(index, 1);
        }
        this._requires.delete(key);
        this._dependencies.delete(key);
    }

    private getDependencies(key: TKey): TKey[] {
        if (!this._dependencies.has(key)) {
            this._dependencies.set(key, []);
        }

        return this._dependencies.get(key)!;
    }

    private getRequires(key: TKey): TKey[] {
        if (!this._requires.has(key)) {
            this._requires.set(key, []);
        }

        return this._requires.get(key)!;
    }

    after(key: TKey, after: TKey[]) {
        if (after.length === 0) {
            return;
        }

        this.resolved = null;
        this.getDependencies(key).push(...after);
    }

    before(key: TKey, before: TKey[]) {
        if (before.length === 0) {
            return;
        }

        this.resolved = null;
        for (const dependency of before) {
            this.getDependencies(dependency).push(key);
        }
    }

    dependsOn(key: TKey, dependsOn: TKey[]) {
        if (dependsOn.length === 0) {
            return;
        }

        this.resolved = null;
        this.getDependencies(key).push(...dependsOn);
        this.getRequires(key).push(...dependsOn);
    }

    private resolve(): TValue[] {
        // Check for non-existent dependencies first
        for (const [key, deps] of this._requires.entries()) {
            for (const dep of deps) {
                if (!this._nodes.find((node) => node.key === dep)) {
                    throw new DependencyGraphError(
                        `Dependency does not exist: ${dep}`,
                    );
                }
            }
        }

        // Check for non-existent soft dependencies and filter them out
        const filteredDependencies = new Map<TKey, TKey[]>();
        for (const [key, deps] of this._dependencies.entries()) {
            const validDeps = deps.filter((dep) =>
                this._nodes.find((node) => node.key === dep),
            );
            if (validDeps.length > 0) {
                filteredDependencies.set(key, validDeps);
            }
        }

        // Separate prepend and append nodes
        const prependNodes = this._nodes.filter(
            (node) => node.position === "prepend",
        );
        const appendNodes = this._nodes.filter(
            (node) => node.position === "append",
        );

        // Reverse prepend nodes to get correct order
        prependNodes.reverse();

        // Combine all nodes in the correct base order
        const allNodes = [...prependNodes, ...appendNodes];

        // Perform topological sort
        const visited = new Set<TKey>();
        const visiting = new Set<TKey>();
        const result: TValue[] = [];

        const visit = (key: TKey): void => {
            if (visiting.has(key)) {
                throw new DependencyGraphError(
                    `Circular dependency detected involving: ${key}`,
                );
            }
            if (visited.has(key)) {
                return;
            }

            visiting.add(key);

            // Visit all dependencies first
            const deps = filteredDependencies.get(key) || [];
            for (const dep of deps) {
                visit(dep);
            }

            visiting.delete(key);
            visited.add(key);

            const node = this._nodes.find((n) => n.key === key);
            if (node) {
                result.push(node.value);
            }
        };

        // Visit all nodes in their base order
        for (const node of allNodes) {
            if (!visited.has(node.key)) {
                visit(node.key);
            }
        }

        return result;
    }

    get nodes() {
        if (this.resolved === null) {
            this.resolved = this.resolve();
        }

        return this.resolved;
    }

    get(key: TKey): TValue | undefined {
        const node = this._nodes.find((node) => node.key === key);
        if (!node) {
            return undefined;
        }

        return node.value;
    }
}
