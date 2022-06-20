import { ApplicationCommandOptionData, ApplicationCommandType, ColorResolvable, CommandInteraction, ContextMenuInteraction, Guild, GuildMember, Interaction, MessageEmbed, Webhook } from "discord.js";
import InteractionEvent from "./Base";
import { UserProfile } from "../../../Framework/Factory/UserProfile";
import type { AkairoClient } from "discord-akairo";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import RelativeTime from "dayjs/plugin/relativeTime";
import { TaskManager } from "../../../Framework/Factory/Task";

export interface InteractionRegister {
    description?: string,
    name: string,
    type: ApplicationCommandType
}

/**
 * @class Interaction Event.
 * @description This is the base Class. New Interactions should extend upon this class.
 */
export default class RemoteProfile extends InteractionEvent {
    constructor() {
       super();
    }

    /**
     * @method Register
     * @description A method of the Interaction class for registering the interaction with metadata.
     * @returns <InteractionRegister> (Enum).
     */
    override register(): InteractionRegister {
        return {
            // description: "This is a base interaction.",
            name: "Profile",
            type: "USER"
        }
    }

    /**
     * @method interactionPerm
     * @description A method for determining whether the interaction should be handled or not.
     * @param member Guild Member instance.
     * @returns boolean.
     */
    override async interactionPerm(member: GuildMember): Promise<boolean> {
        return await true;
    }

    /**
     * @method handlePerm
     * @description A method for determining whether there should be pre-flight checks before sending to the handler.
     * @param interaction Interaction of the handler.
     * @param member Guild Member of the interactor.
     * @returns boolean
     */
    override async handlePerm(interaction: Interaction, member: GuildMember): Promise<boolean> {
        return await true;
    }

    /**
     * @method Execute
     * @description The main driver of the class.
     * @param interaction Interaction of the event emitted.
     * @returns void
     */
    // You will need to cast the Interaction type to your needs since the listener handler already manages this. (For Intellisense)
    override async execute(interaction: ContextMenuInteraction): Promise<void> {
        let UP = new UserProfile(interaction.client, interaction.targetId)
        let TM = new TaskManager(interaction.client);

        let weektaskdata = TM.GetTasksInTwoWeek(interaction.targetId);
        let weektaskid = weektaskdata.map(wt => wt.getId());
        let alltasks = TM.GetTasks(interaction.targetId);
        let overalldata = [];
        
        for (let i = 0; i < alltasks.length; i++) {
            if (!weektaskid.includes(alltasks[i].getId()))
                overalldata.push(alltasks[i]);
        }

        let thisweekcontent = ``;
        let overallcontent = ``;

        // Append week content:
        if (weektaskdata.length > 0) {
            // Append into the content variable.
            for (let i = 0; i < weektaskdata.length; i++) {
                thisweekcontent += `\`${weektaskdata[i].getActiveState()}\` **[${weektaskdata[i].getClassId()}]** - [${weektaskdata[i].getName()}](${weektaskdata[i].getRubricLink() || "https://google.com.au"} "${weektaskdata[i].getId()}") - (<t:${dayjs(weektaskdata[i].getDueDate()).unix()}:R>) [(Submit?)](${weektaskdata[i].getSubmitLink()} "Submission link")\n`
            }
        } else {
            thisweekcontent = `They have no tasks due in 2 weeks; they are up to date! ${(interaction.client as AkairoClient).getEmoji('kleeexcited')}`
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
            overallcontent = `They have no tasks registered and are up to date! ${(interaction.client as AkairoClient).getEmoji('kleeexcited')}`
        }

        let embed = new MessageEmbed()
            .setColor(UP.GetColor() as ColorResolvable)
            .setTitle(`Remote Profile`)
            .setThumbnail((await UP.AbstractWebhook()).avatarURL() as string)
            .setDescription(`
They have accumulated over \`${dayjs.duration({seconds: UP.GetStatData()?.cumulative_study as number || 0}).humanize()}\` worth of **studying** over the bot's tracking history whilst balancing it with \`${dayjs.duration({seconds: UP.GetStatData()?.cumulative_break as number || 0}).humanize()}\` worth of **break**.        
            
`)

            .addField(`Tasks due in the new few weeks ―――― [${weektaskdata.length}]`, thisweekcontent)
            .addField(`Overall tasks ―――――――――――― [${overalldata.length}]`, overallcontent)

        interaction.reply({embeds: [embed]})
    }

    /**
     * @method handleInteraction
     * @description The function that handles side interactions (Buttons and Select Menus.)
     * @param interaction Interaction of the event emitted.
     * @returns void
     */
    override handleInteraction(interaction: Interaction): void {
        throw new Error("PROTOCOL NOT OVERRIDDEN");
    }
}