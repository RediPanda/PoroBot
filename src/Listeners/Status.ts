import { Listener } from "discord-akairo";
import type { Client } from "discord.js";
import { Logger, LoggerType } from "../Framework/IO/Logger";

export default class StatusListener extends Listener {
    constructor() {
        super('Status', {
            emitter: 'client',
            event: 'ready'
        });
    }

    override async exec(client: Client): Promise<void> {
        const ListenLogger = new Logger("Events - Client", true);
        ListenLogger.log(LoggerType.DEBUG, `Event received <- ['Status': ReadyEvent]!`);

        client.user?.setActivity(`over 5 tasks registered!`, {type: "WATCHING"});
    }
}