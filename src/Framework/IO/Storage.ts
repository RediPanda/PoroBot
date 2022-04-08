import Enmap from 'enmap';

export interface StorageParam {
    server: string,
    user: string
}

/**
 * The Storage class is responsible for handling persistent data, both on local and remote data buffers.
 * @exports
 * @class Storage
 */
export class Storage {
    selector: StorageType;
    server: string | unknown;
    user: string | unknown;

    constructor({server, user}: StorageParam = {server: '0', user: '0'}) {
        (server ? this.server = server : this.server = "0");
        (user ? this.user = user : this.user = "0");

        this.selector = StorageType.Client;
    }

    select(selector: StorageType): Storage {
        this.selector = selector;

        return this;
    }

    get(key: string): Record<string, unknown> | any {
        const openStream = new Enmap({
            fetchAll: true,
            name: this.selector
        });

        return openStream.get(this.getKey(key)) ?? undefined;
    }

    has(key: string): boolean {
        const openStream = new Enmap({
            fetchAll: true,
            name: this.selector,
        });

        return openStream.has(this.getKey(key))
    }

    set(key: string, value: string|number|boolean|undefined, path?: string): Enmap<string | number> {
        const openStream = new Enmap({
            fetchAll: true,
            name: this.selector,
        });

        if (path) return openStream.set(this.getKey(key), value, path);
        return openStream.set(this.getKey(key), value);
    }

    delete(key: string): Enmap<string | number> {
        const openStream = new Enmap({
            fetchAll: true,
            name: this.selector,
        });

        return openStream.delete(this.getKey(key));
    }

    raw(): Array<string | number>{
        const stream = this.stream();
        const res = stream.keyArray();

        return res;
    }

    stream(): Enmap<string | number> {
        const openStream = new Enmap({
            fetchAll: true,
            name: this.selector,
        });

        return openStream;
    }

    private getId(): string {
        if (this.selector === StorageType.Server) return (this.server as string);
        if (this.selector === StorageType.User) return (this.user as string);
        return "0"
    }

    private getKey(key: string): string {
        if (this.selector !== StorageType.Client) {
            // console.log(`${this.getId()}.${key}`)
            return `${this.getId()}.${key}`;
        }

        // console.log(`${key}`)
        return key;
    }
}

export enum StorageType {
    Client = "Client",
    Server = "Server",
    User = "User",
    Task = "Task"
}