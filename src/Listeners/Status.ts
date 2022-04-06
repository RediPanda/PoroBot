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

        // Loop for every 5 minutes with an up to date member count.
        if (client.user?.id === "919172638327312456") {
            client.user?.setActivity("If you see this bot online, it usually means someone is developing something :)");
        } else {
            setInterval(async () => {
                const YulxVol = await client.guilds.fetch('917479312825933884');
                await YulxVol.fetch();
                const count = YulxVol.approximateMemberCount;
                client.user?.setActivity(`over ${count} users`, {type: 'WATCHING'});
            }, 1000 * 60 * 5);
        }
    }
}