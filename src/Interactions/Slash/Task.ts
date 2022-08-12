import { ApplicationCommandOptionData, ApplicationCommandType, AutocompleteInteraction, ButtonInteraction, CommandInteraction, GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import InteractionEvent from "./Base";
import { Storage, StorageType } from '../../Framework/IO/Storage';
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import RelativeTime from "dayjs/plugin/relativeTime";
import LocalizedFormat from "dayjs/plugin/localizedFormat"
import { Task, TaskManager, ActiveStateOptionData, ActiveState } from "../../Framework/Factory/Task";
import { Modal, TextInputComponent, showModal, ModalSubmitInteraction } from 'discord-modals'

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
        let Embed: MessageEmbed = new MessageEmbed();

        // Fetch and retrive new Task obj via Task Manager.
        let Task: Task = null as any;
        if (TM.ExistByName(TaskName)) Task = TM.GetByName(TaskName);
        if (TM.ExistById(TaskName)) Task = TM.GetById(TaskName);

        // Handle null cases.
        if (Task === null) {
            Embed.setColor("RED");
            Embed.setDescription("The task you tried to view/manage was unavailable at this time!");
            interaction.reply({embeds: [Embed]});
            return;
        }

        // Display the task.
        Embed = Task.toEmbed();

        // Provide admin options if task is owned.
        if (Task.getOwner() === interaction.user.id) {
            const rowA = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId(`Slash.Task.${interaction.user.id}.EditState.${Task.getId()}`)
                        .setPlaceholder('(Optional) Change the state of the task.')
                        .addOptions(ActiveStateOptionData)
                )
            const rowB = new MessageActionRow()
			    .addComponents(
			    	new MessageButton()
			    		.setCustomId(`Slash.Task.${interaction.user.id}.EditA.${Task.getId()}`)
			    		.setEmoji('✏️')
                        .setLabel('Info')
			    		.setStyle('SECONDARY'),
			    )
                .addComponents(
			    	new MessageButton()
			    		.setCustomId(`Slash.Task.${interaction.user.id}.EditB.${Task.getId()}`)
			    		.setEmoji('✏️')
                        .setLabel('Resources')
			    		.setStyle('SECONDARY'),
			    )
                .addComponents(
			    	new MessageButton()
			    		.setCustomId(`Slash.Task.${interaction.user.id}.Submit.${Task.getId()}`)
			    		.setLabel('Submit')
                        .setEmoji('🔖')
			    		.setStyle('SUCCESS'),
			    );

            interaction.reply({embeds: [Embed], components: [rowA, rowB]});
        } else {
            interaction.reply({embeds: [Embed]});
        }
    }

    handlePerm(interaction: ButtonInteraction | SelectMenuInteraction): boolean {
        if ((interaction as ButtonInteraction).customId.split('.')[2] === interaction.member?.user.id) return true;
        return false;
    }

    handleButton(interaction: ButtonInteraction): void {
        const args = interaction.customId.split(".");
        const TM = new TaskManager(interaction.client);
        const Task = TM.GetById(args[4]);

        switch(args[3]) {
            case "EditA": {
                // Create modal.
                const modal = new Modal() // We create a Modal
                .setCustomId(`Slash.Task.${interaction.user.id}.EditA.${Task.getId()}`)
                .setTitle(`Editing: ${Task.getName()}`)
                .addComponents(
                  new TextInputComponent() // We create a Text Input Component
                  .setCustomId('ClassName')
                  .setLabel('Class Name')
                  .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                  .setMinLength(1)
                  .setMaxLength(12)
                  .setPlaceholder('(Leave empty for no edit.)')
                  .setRequired(false) // If it's required or not
                )
                .addComponents(
                    new TextInputComponent() // We create a Text Input Component
                    .setCustomId('Type')
                    .setLabel('Type')
                    .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                    .setMinLength(1)
                    .setMaxLength(12)
                    .setPlaceholder('(Leave empty for no edit.)')
                    .setRequired(false) // If it's required or not 
                )
                .addComponents(
                    new TextInputComponent() // We create a Text Input Component
                    .setCustomId('DueDate')
                    .setLabel('Due Date')
                    .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                    .setMinLength(5)
                    .setMaxLength(5)
                    .setPlaceholder('(Leave empty for no edit.) 01/01 (DD/MM)')
                    .setRequired(false) // If it's required or not 
                )
                .addComponents(
                    new TextInputComponent() // We create a Text Input Component
                    .setCustomId('DueTime')
                    .setLabel('Due Time')
                    .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                    .setMinLength(5)
                    .setMaxLength(5)
                    .setPlaceholder('(Leave empty for no edit.) 21:00 (HH:MM) (24-hour format)')
                    .setRequired(false) // If it's required or not 
                )

                showModal(modal, {
                    client: interaction.client,
                    interaction: interaction
                })
                break;
            }

            case "EditB": {
                const modalTemplate = new Modal() // We create a Modal
                .setCustomId(`Slash.Task.${interaction.user.id}.EditB.${Task.getId()}`)
                .setTitle(`Editing: ${Task.getName()}`)
                .addComponents(
                    new TextInputComponent() // We create a Text Input Component
                    .setCustomId('RubricLink')
                    .setLabel('Rubric Link')
                    .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                    .setMinLength(5)
                    .setMaxLength(220)
                    .setPlaceholder('(Leave empty for no edit.)')
                    .setRequired(false) // If it's required or not
                )
                .addComponents(
                    new TextInputComponent() // We create a Text Input Component
                    .setCustomId('SubmitLink')
                    .setLabel('Submission Link')
                    .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                    .setMinLength(5)
                    .setMaxLength(220)
                    .setPlaceholder('(Leave empty for no edit.)')
                    .setRequired(false) // If it's required or not 
                )

                showModal(modalTemplate, {
                    client: interaction.client,
                    interaction: interaction
                })
                break;
            }

            case "Submit": {
                // Mark the task in the system as done.
                Task.setActiveState(ActiveState.SUBMITTED);

                // Update embed.
                let embed = Task.toEmbed();

                // Edit the original message.
                (interaction.message as Message).edit({embeds: [embed]});
                interaction.reply({content: "Task has been updated!", ephemeral: true});
                break;
            }
        }
    }

    // THIS FUNCTION ONLY RUNS FOR EDIT-MODE OPERATIONS ONLY.
    handleModal(modal: ModalSubmitInteraction): void {
        const args = modal.customId.split(".");
        const TM = new TaskManager(modal.client);
        const Task = TM.GetById(args[4]);

        switch(args[3]) {
            case "EditA": {
                let [ClassName, Type, DueDate, DueTime] = [
                    modal.getTextInputValue("ClassName"),
                    modal.getTextInputValue("Type"),
                    modal.getTextInputValue("DueDate"),
                    modal.getTextInputValue("DueTime")
                ]

                if (ClassName !== null) Task.setName(ClassName);
                if (Type !== null) Task.setType(Type);

                if (DueDate !== null) {
                    let modDate = Task.getDueDate();

                    modDate.setMonth(parseInt(DueDate.split("/")[1]) - 1, parseInt(DueDate.split("/")[0]))
                    Task.setDueDate(modDate);
                }
                    
                if (DueTime !== null) {
                    let modTime = Task.getDueDate();

                    modTime.setHours(parseInt(DueTime.split(":")[0]), parseInt(DueTime.split(":")[1]))
                    Task.setDueDate(modTime);
                 }
                break;
            }
            case "EditB": {
                let [RubricLink, SubmitLink] = [
                    modal.getTextInputValue("RubricLink"),
                    modal.getTextInputValue("SubmitLink")
                ]

                if (RubricLink !== null) Task.setRubricLink(RubricLink);
                if (SubmitLink !== null) Task.setSubmitLink(SubmitLink);
                break;
            }
        }
        modal.reply({content: "You have successfully edited the task!", ephemeral: true})
    }

    handleInteraction(interaction: SelectMenuInteraction): void {
        const args = interaction.customId.split(".");
        const TM = new TaskManager(interaction.client);
        const Task = TM.GetById(args[4]);

        let selection = interaction.values[0];
        Task.setActiveState(ActiveState[selection as ActiveState]);

        // Update embed.
        let embed = Task.toEmbed();

        // Edit the original message.
        (interaction.message as Message).edit({embeds: [embed]});
        interaction.reply({content: "Task has been updated!", ephemeral: true});
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

        const filtered = tasks.filter(t => t.startsWith(focusedValue)).splice(0, 25);
        interaction.respond(
            filtered.map(opt => ({ name: opt, value: opt}))
        )
    }
}