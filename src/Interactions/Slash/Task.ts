import { ApplicationCommandOptionData, ApplicationCommandType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, GuildMember, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import InteractionEvent from "./Base";
import { Storage, StorageType } from '../../Framework/IO/Storage';
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import RelativeTime from "dayjs/plugin/relativeTime";
import LocalizedFormat from "dayjs/plugin/LocalizedFormat"
import { Task, TaskManager } from "../../Framework/Factory/Task";

dayjs.extend(duration);
dayjs.extend(RelativeTime);
dayjs.extend(LocalizedFormat)

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
export default class TaskCMD extends InteractionEvent {
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
            description: "Grab and manage your tasks.",
            name: "task",
            type: "CHAT_INPUT",
            options: [{ // Task ID.
                type: 3,
                name: "taskid",
                description: "Select the task you wish to view and manage.",
                required: true,
                autocomplete: true
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
        const TM = new TaskManager(interaction.client);
        const TaskName = interaction.options.getString("taskid", true);
        const Embed = new MessageEmbed();

        // Fetch and retrive new Task obj via Task Manager.
        let Task = null as any;
        if (TM.ExistByName(TaskName)) Task = TM.GetByName(TaskName);
        if (TM.ExistById(TaskName)) Task = TM.GetById(TaskName);

        // Handle null cases.
        if (Task === null) {
            Embed.setColor("RED");
            Embed.setDescription("The task you tried to view/manage was unavailable at this time!");
            interaction.reply({embeds: [Embed]});
        }

        // Display the task.
        Embed.setTitle(`Task: ${Task.getName()}`)
        Embed.setColor("BLURPLE");
        Embed.addField("Task Information:", `
 ╰― **Task Owner:** <@${Task.getOwner()}>
 ╰― **Status:** \`${Task.getActiveState()}\`
 ╰― **Class Name and Type:** \`${Task.getClassId().trim()}\` as \`${Task.getType().trim()}\`
 ╰― **Due Time:** ${dayjs(Task.getDueDate()).format('dddd, MMMM D h:mm A')}
        `)

        Embed.addField("Task Resources:", `
        [Rubric Link](${Task.getRubricLink() || "https://google.com.au"} "URL pointing to the Task's Rubric/Primary source.")
        [Submission Link](${Task.getSubmitLink() || "https://google.com.au"} "URL pointing to the Task's Submission/Secondary source.") (Closes in <t:${dayjs(Task.getDueDate()).unix()}:R>)
        {{MORE_RESOURCES_()}}
        `)

        // Provide admin options if task is owned.
        if (Task.getOwner() === interaction.user.id) {
            const row = new MessageActionRow()
			    .addComponents(
			    	new MessageButton()
			    		.setCustomId('Slash.Task.Primary')
			    		.setLabel('Primary')
			    		.setStyle('PRIMARY'),
			    );

            interaction.reply({embeds: [Embed], components: [row]});
        } else {
            interaction.reply({embeds: [Embed]});
        }
    }

    handlePerm(): boolean {
        return true;
    }

    handleButton(interaction: ButtonInteraction): void {
        console.log(interaction)
    }

    // Custom handler that hooks and listens for autocomplete interactions.
    handleAuto(interaction: AutocompleteInteraction): void {
        const storage = new Storage({server: '0', user: '0'}).select(StorageType.Task).stream();
        const focusedValue = interaction.options.getFocused() as string;
        let tasks: string[] = [];

        // Append all tasks by ID.
        tasks = tasks.concat(storage.keyArray() as unknown as string);

        // Append all tasks by name.
        tasks = tasks.concat(storage.array().map(t => t.name));

        const filtered = tasks.filter(t => t.startsWith(focusedValue));
        interaction.respond(
            filtered.map(opt => ({ name: opt, value: opt}))
        )
    }
}