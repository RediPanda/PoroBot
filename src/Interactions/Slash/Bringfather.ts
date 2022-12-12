import { ApplicationCommandOptionData, ApplicationCommandType, CommandInteraction, GuildMember, MessageEmbed, Webhook } from "discord.js";
import InteractionEvent from "./Base";

export interface InteractionRegister {
    description?: string,
    name: string,
    type: ApplicationCommandType
    choices?: Array<any>
    options?: Array<ApplicationCommandOptionData>
}

const father_id = "353837316680450050"

/**
 * @class Interaction Event.
 * @description This is the base Class. New Interactions should extend 
 */
export default class BringFatherCMD extends InteractionEvent {
    constructor() {
        // NOOP. (Empty for most cases, but here incase you need persisass.)
        super();
    }

    /**
     * @method Register
     * @description A method of the Interaction class for registering tta.
     * @returns <InteractionRegister> (Enum).
     */
    override register(): any { // The any is a cheat here as we need to directly change the data.
        // You may log any interactions here that needs to be instantiated before the execution starts.
        // You can think of this as the constructor of the class.
        // new Logger("Interaction Register - Base", true).log(LoggerType.ERROR, `${LC.FgRed}${LC.BgWhite}Instance has not been overidden.`)

        return {
            description: "Brings father wherever he is to you.",
            name: "bringfather",
            type: "CHAT_INPUT"
        }
    }

    /**
     * @method interactionPerm
     * @description A method for determining whether the interaction should be handled or not.
     * @param member Guild Member instance.
     * @returns boolean.
     */
    override async interactionPerm(member: GuildMember): Promise<boolean> {
        if (await member?.roles.cache.has("864720664086839326")) return true;

        return false;
    }

    /**
     * @method Execute
     * @description The main driver of the class.
     * @param interaction Interaction of the event emitted.
     * @returns void
     */
    // You will need to cast the Interaction type to your needs since the listener handler already manages this. (For Intellisense)
    override async execute(interaction: CommandInteraction): Promise<void> {
        const embed: MessageEmbed = new MessageEmbed()

        // Commit and attempt to run the voice bring operation.
        try {
            // Bring father.
            let father = await interaction.guild.members.fetch(father_id);

            if (!father.voice.channel) {
                // Father is not in a voice channel.
                embed.setDescription(`Could not summon father! Father is not in a voice channel!`)
                embed.setColor("RED")
                
                interaction.reply({embeds: [embed], ephemeral: true});
                return;
            }

            // Please attempt to move father now.
            await father.voice.setChannel(interaction.member.voice.channelId, `${interaction.member.user.tag} has moved father!`)

            // Customise the message.
            embed.setDescription(`You have brought <@${father_id}> to <#${(interaction.member as GuildMember).voice.channelId}>`)
            embed.setColor("BLURPLE")

            interaction.reply({embeds: [embed]});
        } catch (err) {
            // Compose the error message.
            embed.setDescription(`Error. Please contact Klee's One-And-Only.`)
            embed.setColor("RED")

            console.warn(err)

            interaction.reply({embeds: [embed]});
        }
    }

    handlePerm(): boolean {
        return true;
    }
}