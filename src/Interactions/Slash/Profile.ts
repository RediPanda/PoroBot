import { ApplicationCommandOptionData, ApplicationCommandType, ColorResolvable, CommandInteraction, Guild, GuildMember, MessageEmbed, Webhook } from "discord.js";
import InteractionEvent from "./Base";
import { UserProfile } from "../../Framework/Factory/UserProfile";
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
    options?: Array<ApplicationCommandOptionData>
}

/**
 * @class Interaction Event.
 * @description This is the base Class. New Interactions should extend 
 */
export default class StartSession extends InteractionEvent {
    constructor() {
        // NOOP. (Empty for most cases, but here incase you need persisass.)
        super();
    }

    /**
     * @method Register
     * @description A method of the Interaction class for registering tta.
     * @returns <InteractionRegister> (Enum).
     */
    override register(): InteractionRegister {
        // You may log any interactions here that needs to be instantiated before the execution starts.
        // You can think of this as the constructor of the class.
        // new Logger("Interaction Register - Base", true).log(LoggerType.ERROR, `${LC.FgRed}${LC.BgWhite}Instance has not been overidden.`)

        return {
            description: "Fetches your profile for the week.",
            name: "profile",
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
        let UP = new UserProfile(interaction.client, interaction.user.id)
        let TM = new TaskManager(interaction.client);

        let weektaskdata = TM.GetTasksInTwoWeek(interaction.user.id);
        let overalldata = TM.GetTasks(interaction.user.id);

        let thisweekcontent = ``;
        let overallcontent = ``;

        // Append week content:
        if (weektaskdata.length > 0) {
            // Append into the content variable.
            for (let i = 0; i < weektaskdata.length; i++) {
                thisweekcontent += `\`${weektaskdata[i].getActiveState()}\` **[${weektaskdata[i].getClassId()}]** - [${weektaskdata[i].getName()}](${weektaskdata[i].getRubricLink() || "https://google.com.au"} "${weektaskdata[i].getId()}") - (<t:${dayjs(weektaskdata[i].getDueDate()).unix()}:R>) [(Submit?)](${weektaskdata[i].getSubmitLink()} "Submission link")\n`
            }
        } else {
            thisweekcontent = `You have no tasks due in 2 weeks. You are up to date! ${(interaction.client as AkairoClient).getEmoji('kleeexcited')}`
        }

        // Append total content:
        if (overalldata.length > 0) {
            // Append into the content variable.
            for (let i = 0; i < overalldata.length; i++) {
                if (i === 5) {
                    overallcontent += "*some tasks have been hidden*";
                    break;
                }

                overallcontent += `\`${overalldata[i].getActiveState()}\` **[${overalldata[i].getClassId()}]** - [${overalldata[i].getName()}](${overalldata[i].getRubricLink() || "https://google.com.au"} "${overalldata[i].getId()}") - (<t:${dayjs(overalldata[i].getDueDate()).unix()}:R>) [(Submit?)](${overalldata[i].getSubmitLink()} "Submission link")\n`
            }
        } else {
            overallcontent = `You have no tasks registered. You are up to date! ${(interaction.client as AkairoClient).getEmoji('kleeexcited')}`
        }

        let embed = new MessageEmbed()
            .setColor(UP.GetColor() as ColorResolvable)
            .setTitle(`${(interaction.member as GuildMember).displayName}'s Profile`)
            .setThumbnail((await UP.AbstractWebhook()).avatarURL() as string)
            .setDescription(`${(interaction.client as AkairoClient).utils.getToastMessage()}, **${(interaction.member as GuildMember).displayName}**!

You have accumulated over \`${dayjs.duration({seconds: UP.GetStatData()?.cumulative_study as number || 0}).humanize()}\` worth of **studying** over the bot's tracking history whilst balancing it with \`${dayjs.duration({seconds: UP.GetStatData()?.cumulative_break as number || 0}).humanize()}\` worth of **break**.        
            
`)

            .addField(`Tasks due in the new few weeks ―――― [${weektaskdata.length}]`, thisweekcontent)
            .addField(`Overall tasks ―――――――――――― [${TM.GetTasks(interaction.user.id).length}]`, overallcontent)

        interaction.reply({embeds: [embed]})
    }

    handlePerm(): boolean {
        return true;
    }
}