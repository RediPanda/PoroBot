import { Listener } from "discord-akairo";
import type { Client } from "discord.js";
import { Logger, LoggerType } from "../Framework/IO/Logger";
import { Storage, StorageType } from "../Framework/IO/Storage";

export default class StatusListener extends Listener {
    constructor() {
        super('Status', {
            emitter: 'client',
            event: 'ready'
        });
    }

    override async exec(client: Client): Promise<void> {
        const storage = new Storage({server: '0', user: '0'}).select(StorageType.Task).stream();
        const ListenLogger = new Logger("Events - Client", true);
        ListenLogger.log(LoggerType.DEBUG, `Event received <- ['Status': ReadyEvent]!`);

        client.user?.setActivity(`over ${storage.array().length} tasks registered!`, {type: "WATCHING"});
    }
}