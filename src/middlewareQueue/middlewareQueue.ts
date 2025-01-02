import { DependencyGraph } from "../dependencyGraph";
import { Middleware } from "./types";

export interface UseMiddleware<TArgs extends unknown[]> {
    dependsOn?: Middleware<TArgs>[];
}

export class MiddlewareQueue<TArgs extends unknown[]> {
    private middlewares = new DependencyGraph<
        Middleware<TArgs>,
        Middleware<TArgs>
    >();

    add(middleware: Middleware<TArgs>, options: UseMiddleware<TArgs> = {}) {
        this.middlewares.append(middleware, middleware, {
            dependsOn: options.dependsOn,
        });
    }

    remove(listener: Middleware<TArgs>) {
        this.middlewares.remove(listener);
    }

    async emit(...eventArgs: TArgs) {
        let _stop = false;

        const event = {
            stop() {
                _stop = true;
            },
        };

        for (const listener of this.middlewares.nodes) {
            if (_stop) {
                break;
            }
            await listener(event, ...eventArgs);
        }
    }
}