import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "discord-akairo";
import type { CommandInteraction, Message } from "discord.js";


export default class PingCommand extends Command {
    slashType: string;

    constructor() {
        super('ping', {
            aliases: ['ping']
        });

        this.slashType = "GUILD"; // GUILD/GLOBAL.
    }

    override async exec(message: Message): Promise<void> {
        message.reply("Pinging Server Data...");
    }

    async interactionPerm(): Promise<boolean> {
        return await true;
    }

    async interaction(interaction: CommandInteraction): Promise<void> {
        interaction.reply({content: `Pong with a latency of ${interaction.client.ws.ping}ms!`, ephemeral: true});
    }
 
    getSlashData(): SlashCommandBuilder {
        return new SlashCommandBuilder()
                .setName('ping')
                .setDescription('Ping the bot!');
    }
}