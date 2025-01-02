import { DependencyGraphError } from "./error";

interface Node<TKey, TValue> {
    key: TKey;
    value: TValue;
    position: "prepend" | "append";
}

export interface AddOptions<TKey> {
    dependsOn?: TKey[];
}

export interface RemoveOptions {
    recursive?: boolean;
}

export class DependencyGraph<TKey, TValue> {
    private _nodes: Node<TKey, TValue>[] = [];
    private _dependencies: Map<TKey, TKey[]> = new Map();

    private resolved: TValue[] | null = null;

    append(key: TKey, value: TValue, options?: AddOptions<TKey>) {
        if (this._nodes.some((node) => node.key === key)) {
            throw new DependencyGraphError(`Node already exists: ${key}`);
        }

        this.resolved = null;

        this._nodes.push({ key, value, position: "append" });
        this.dependsOn(key, options?.dependsOn ?? []);
    }

    prepend(key: TKey, value: TValue, options?: AddOptions<TKey>) {
        if (this._nodes.some((node) => node.key === key)) {
            throw new DependencyGraphError(`Node already exists: ${key}`);
        }

        this.resolved = null;

        this._nodes.push({ key, value, position: "prepend" });
        this.dependsOn(key, options?.dependsOn ?? []);
    }

    remove(key: TKey, options?: RemoveOptions) {
        this.resolved = null;

        const dependents = Array.from(
            this._dependencies
                .entries()
                .filter(([_, dependencies]) => dependencies.includes(key)),
        );

        if (options?.recursive) {
            for (const [dependent] of dependents) {
                this.remove(dependent, options);
            }
        } else if (dependents.length > 0) {
            throw new DependencyGraphError(
                `Cannot remove node with dependencies: ${key}`,
            );
        }

        const index = this._nodes.findIndex((node) => node.key === key);
        if (index !== -1) {
            this._nodes.splice(index, 1);
        }
        this._dependencies.delete(key);
    }

    dependsOn(key: TKey, dependsOn: TKey[]) {
        this.resolved = null;
        for (const dependency of dependsOn) {
            if (!this._dependencies.has(key)) {
                this._dependencies.set(key, []);
            }
            this._dependencies.get(key)!.push(dependency);
        }
    }

    private resolve(): TValue[] {
        const resolved: Array<Node<TKey, TValue>> = [];
        const temp: Set<TKey> = new Set();

        const visit = (key: TKey) => {
            if (temp.has(key)) {
                throw new DependencyGraphError(
                    `Circular dependency detected: ${key}`,
                );
            }

            const resolvedIndex = resolved.findIndex((n) => n.key === key);
            if (resolvedIndex !== -1) {
                return resolvedIndex;
            }

            temp.add(key);
            const dependencies = this._dependencies.get(key) || [];
            dependencies.forEach(visit);
            temp.delete(key);

            const node = this._nodes.find((n) => n.key === key);
            if (!node) {
                throw new DependencyGraphError(`Missing node: ${key}`);
            }

            if (node.position === "append") {
                resolved.push(node);
            } else {
                const lastDependency = Math.max(
                    ...dependencies.map((dependency) =>
                        resolved.findIndex((n) => n.key === dependency),
                    ),
                );

                resolved.splice(lastDependency + 1, 0, node);
            }
        };

        for (const node of this._nodes) {
            visit(node.key);
        }

        return resolved.map((node) => node.value);
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
