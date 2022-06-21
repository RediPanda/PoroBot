import { ApplicationCommandOptionData, ApplicationCommandType, ColorResolvable, CommandInteraction, Guild, GuildMember, MessageEmbed, Webhook } from "discord.js";
import InteractionEvent from "./Base";
import { MetricType, Status, UserProfile } from "../../Framework/Factory/UserProfile";
import type { AkairoClient } from "discord-akairo";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import RelativeTime from "dayjs/plugin/relativeTime";
import { TaskManager } from "../../Framework/Factory/Task";

dayjs.extend(duration);
dayjs.extend(RelativeTime);

export interface InteractionRegister {
    description?: string,
    name: string,
    type: ApplicationCommandType
    choices?: Array<any>
    options?: Array<ApplicationCommandOptionData>
}

/**
 * @class Interaction Event.
 * @description This is the base Class. New Interactions should extend 
 */
export default class ResetCMD extends InteractionEvent {
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
            description: "Reset the metric timer.",
            name: "reset",
            type: "CHAT_INPUT",
            options: [{ // User Parameter.
                type: 6,
                name: "user",
                description: "Select a user you wish to target the reset function.",
                required: true
            },
            { // Measurement metric type choice.
                type: 3,
                name: "metric",
                description: "Choose the type of metrics you wish to start the timer for.",
                choices: [
                    {name: "Study", value: "study"},
                    {name: "Break", value: "break"}
                ],
                required: true
            }]
        }
    }

    /**
     * @method interactionPerm
     * @description A method for determining whether the interaction should be handled or not.
     * @param member Guild Member instance.
     * @returns boolean.
     */
    override async interactionPerm(member: GuildMember): Promise<boolean> {
        if ((member.client as AkairoClient).ownerID.includes(member.id)) return true;
        else return false;
    }

    /**
     * @method Execute
     * @description The main driver of the class.
     * @param interaction Interaction of the event emitted.
     * @returns void
     */
    // You will need to cast the Interaction type to your needs since the listener handler already manages this. (For Intellisense)
    override async execute(interaction: CommandInteraction): Promise<void> {
        let metric = interaction.options.getString('metric', true);
        let user = interaction.options.getUser('user', true);

        let EMBED = new MessageEmbed();

        let UP = new UserProfile(interaction.client, user.id);
        UP.MeasureStatistics(Status.RESET, metric as MetricType);

        // Create embed.
        EMBED.setColor("ORANGE")
        EMBED.setDescription(`You have successfully reset the timer for \`${user.username}\` measuring \`${metric}\`.`);
        interaction.reply({embeds: [EMBED]});
    }

    handlePerm(): boolean {
        return true;
    }
}