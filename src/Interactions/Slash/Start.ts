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
 * @function invert
 * @description Inverts the given metric to it's opposing other.
 */
function invert(metric: MetricType): MetricType {
    if (metric === MetricType.Break) return MetricType.Study;
    else return MetricType.Break;
}

/**
 * @class Interaction Event.
 * @description This is the base Class. New Interactions should extend 
 */
export default class StartCMD extends InteractionEvent {
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
            description: "Starts the metric timer.",
            name: "start",
            type: "CHAT_INPUT",
            options: [{
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
        // This supports promises!
        // console.log(member.id);
        return await true;
    }

    /**
     * @method Execute
     * @description The main driver of the class.
     * @param interaction Interaction of the event emitted.
     * @returns void
     */
    // You will need to cast the Interaction type to your needs since the listener handler already manages this. (For Intellisense)
    override async execute(interaction: CommandInteraction): Promise<void> {
        let metric = interaction.options.getString('metric');
        let EMBED = new MessageEmbed();
        let desc = ``;

        // Cancel the interaction if no parameter was provided.
        if (metric === null) {
            EMBED.setDescription("No metric parameter has been provided!")
            EMBED.setColor("RED")
            interaction.reply({embeds: [EMBED], ephemeral: true})
            return;
        }

        let UP = new UserProfile(interaction.client, interaction.user.id);
        const time = UP.GetStatData().time_measurement;

        // Cases when the last state of the metric is the same metric provided and already measuring.
        if ((time.study_status === Status.MEASURING && metric === MetricType.Study) || (time.break_status === Status.MEASURING && metric === MetricType.Break)) {
            EMBED.setDescription("You can't start the same timer again whilst it's already running!");
            EMBED.setColor("RED")
            interaction.reply({embeds: [EMBED], ephemeral: true})
            return;
        }

        // Edge case if MEASURING was the last state for (opposite).
        if (time[`${invert(metric as MetricType)}_status`] === Status.MEASURING) {
            desc += `*We've noticed that you left the ${invert(metric as MetricType)} timer on, so we have turned this timer off for you!*\n`;
            UP.MeasureStatistics(Status.AVAILABLE, invert(metric as MetricType));
        }

        UP.MeasureStatistics(Status.MEASURING, metric as MetricType);
        desc += `You have successfully started the timer for \`${metric}\``;

        // Create embed.
        EMBED.setColor("GREEN")
        EMBED.setDescription(desc);
        interaction.reply({embeds: [EMBED]});
    }

    handlePerm(): boolean {
        return true;
    }
}