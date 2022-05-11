import { Listener } from "discord-akairo";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Logger, LoggerType } from "../Framework/IO/Logger";

export default class EventsBlockListener extends Listener {
    constructor() {
        super('eventBlock', {
            emitter: 'events',
            event: 'INT_BLOCKED'
        });
    }

    override async exec(interaction: CommandInteraction, source: Array<Record<string, unknown>>): Promise<void> {
        const ListenLogger = new Logger("Events - Client", true)
        ListenLogger.log(LoggerType.DEBUG, `Event received <- [Events Blocked] [Origin: /${source}].`)

        const Embed = new MessageEmbed().setColor('RED').setDescription(`${this.client.getEmoji('warning')} Insufficient permission to run interaction.`)
        
        interaction.reply({embeds: [Embed], ephemeral: true});   
    }
}