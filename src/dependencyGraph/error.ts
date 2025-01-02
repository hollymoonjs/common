export class DependencyGraphError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DependencyGraphError";
    }
}
