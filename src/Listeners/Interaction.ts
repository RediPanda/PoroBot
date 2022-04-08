import { Listener } from "discord-akairo";
import { ButtonInteraction, CommandInteraction, ContextMenuInteraction, Interaction, MessageEmbed, SelectMenuInteraction } from "discord.js";
import { Logger, LoggerType } from "../Framework/IO/Logger";
import path from "path";

const ErrorEmbed = new MessageEmbed().setColor("RED").setDescription("There was an issue running this interaction!").setFooter("Please contact Redi Panda_#0247 for assistance.")

export default class InteractionListener extends Listener {
    constructor() {
        super('interactionCreate', {
            emitter: 'client',
            event: 'interactionCreate'
        });
    }

    override async exec(interaction: Interaction): Promise<void> {
        const ListenLogger = new Logger("Events - Interactions", true)
        ListenLogger.log(LoggerType.DEBUG, `Interaction received <- [${interaction.id}] (${interaction.type}) (${(interaction as CommandInteraction).commandName || (interaction as SelectMenuInteraction).customId || (interaction as ButtonInteraction).customId || (interaction as ContextMenuInteraction).commandName || "Unidentified."})!`)

        let botPath = 'src';
        if (process.env.NODE_ENV === 'production') botPath = 'dist'

        // Checks if the interaction is a slash command.
        if (interaction.isCommand()) {
            // Execute the command.
            try {
                const slashExec = await import(path.join(process.cwd(), `${botPath}`, 'Interactions', 'Slash', `${toTitleCase(interaction.commandName).replace(/ /ig, "_")}`))
                const cmd = await new slashExec.default()
                if (await cmd.interactionPerm(interaction.member) === true) await cmd.execute(interaction);
                else this.client.events.emit('INT_BLOCKED', interaction, toTitleCase(interaction.commandName));
            } catch(err: unknown) {
                ListenLogger.log(LoggerType.ERROR, `${err}`);
                interaction.reply({embeds: [ErrorEmbed], ephemeral: true})
            }
        }

        // Checks if the interaction is a context menu app.
        if (interaction.isContextMenu()) {
            try {
                const instance = await import(path.join(process.cwd(), `${botPath}`, 'Interactions', 'Context', `${toTitleCase((interaction as ContextMenuInteraction).targetType)}`, `${toTitleCase(interaction.commandName).replace(/ /ig, "_")}`))
                // console.log(slashExec)
                const cmd = await new instance.default()
                if (await cmd.interactionPerm(interaction.member) === true) cmd.execute(interaction);
                else this.client.events.emit('INT_BLOCKED', interaction, toTitleCase(interaction.commandName));
            } catch(err: unknown) {
                ListenLogger.log(LoggerType.ERROR, `${err}`);
                interaction.reply({embeds: [ErrorEmbed], ephemeral: true})
            }
        }

        // Check if the interaction is a select menu.
        if (interaction.isSelectMenu()) {
            // Always Disable.
            if (interaction.customId === "Disabled") return;
            
            let filepath: string = "";
            let actions: string[] = interaction.customId.split('.');


            switch(actions[0]) {
                case "Context_User": {
                    filepath = path.join(process.cwd(), `${botPath}`, 'Interactions', 'Context', 'User', `${(actions[1]).replace(/ /ig, "_")}`);
                    break;
                }
                case "Context_Message": {
                    filepath = path.join(process.cwd(), `${botPath}`, 'Interactions', 'Context', 'Message', `${(actions[1]).replace(/ /ig, "_")}`);
                    break;
                }
                case "Slash": {
                    filepath = path.join(process.cwd(), `${botPath}`, 'Interactions', 'Slash', `${(actions[1]).replace(/ /ig, "_")}`);
                    break;
                }
                case "Event": {
                    filepath = path.join(process.cwd(), `${botPath}`, 'Listeners', `${(actions[1]).replace(/ /ig, "_")}`);
                    break;
                }
            }

            try {
                const instance = await import(filepath);

                const cmd = await new instance.default()
                if (await cmd.handlePerm(interaction, interaction.member) === true) cmd.handleInteraction(interaction);
                else this.client.events.emit('INT_BLOCKED', interaction, toTitleCase(actions[1]));
            } catch(err: unknown) {
                ListenLogger.log(LoggerType.ERROR, `${err}`);
                interaction.reply({embeds: [ErrorEmbed], ephemeral: true})
            }
        }

        if (interaction.isButton()) {
            // Always Disable.
            if (interaction.customId === "Disabled") return;

            let filepath: string = "";
            let actions: string[] = interaction.customId.split('.');

            switch(actions[0]) {
                case "Context_User": {
                    filepath = path.join(process.cwd(), `${botPath}`, 'Interactions', 'Context', 'User', `${(actions[1]).replace(/ /ig, "_")}`);
                    break;
                }
                case "Context_Message": {
                    filepath = path.join(process.cwd(), `${botPath}`, 'Interactions', 'Context', 'Message', `${(actions[1]).replace(/ /ig, "_")}`);
                    break;
                }
                case "Slash": {
                    filepath = path.join(process.cwd(), `${botPath}`, 'Interactions', 'Slash', `${(actions[1]).replace(/ /ig, "_")}`);
                    break;
                }
                case "Event": {
                    filepath = path.join(process.cwd(), `${botPath}`, 'Listeners', `${(actions[1]).replace(/ /ig, "_")}`);
                    break;
                }
            }

            try {
                const instance = await import(filepath);

                const cmd = await new instance.default()
                if (await cmd.handlePerm(interaction, interaction.member) === true) cmd.handleButton(interaction);
                else this.client.events.emit('INT_BLOCKED', interaction, toTitleCase(actions[1]));
            } catch(err: unknown) {
                ListenLogger.log(LoggerType.ERROR, `${err}`);
                interaction.reply({embeds: [ErrorEmbed], ephemeral: true})
            }
        }
    }
}

function toTitleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}