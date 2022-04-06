import type { AkairoClient } from 'discord-akairo';
import type { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * The Storage class is responsible for handling persistent data, both on local and remote data buffers.
 * @exports
 * @class Storage
 */
export class Query {
    private client: AkairoClient;
    private query: string;
    private prepared: Array<Object>
    private buffer: Array<OkPacket | ResultSetHeader | RowDataPacket[] | RowDataPacket[][] | OkPacket[] | FieldPacket[]>;

    constructor(client: AkairoClient, query: string) {
        this.client = client;
        this.query = query;
        this.prepared = [];
        this.buffer = [];
    }

    // Clears prepared statements.
    private clearPrepared(): void {
        this.prepared = [];
    }

    /**
     * @method prepare
     * Adding prepared data for prepared statements.
     */
    public prepare(arr: Array<Object>): Query {
        this.prepared = arr;
        return this;
    }

    // Uses the client pool for executions.
    public async exec(): Promise<any> {
        this.buffer = await this.client.pool.execute(this.query, this.prepared);
        return this.buffer?.[0];
    }

    public getBuffer(): OkPacket | ResultSetHeader | RowDataPacket[] | RowDataPacket[][] | OkPacket[] | FieldPacket[] {
        return this.buffer?.[1];
    }
}