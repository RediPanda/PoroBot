import { ApplicationCommandType, ButtonInteraction, Guild, GuildMember, Interaction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import randomatic from "randomatic";
import InteractionEvent from "./Base";
import { Modal, TextInputComponent, showModal, ModalSubmitInteraction } from 'discord-modals'
import { UserProfile } from "../../Framework/Factory/UserProfile";
import { ActiveState, TaskManager } from "../../Framework/Factory/Task";

export interface InteractionRegister {
    description?: string,
    name: string,
    type: ApplicationCommandType
}

/**
 * @class Interaction Event.
 * @description This is the base Class. New Interactions should extend upon this class.
 */
export default class NewTask extends InteractionEvent {
    constructor() {
        // NOOP. (Empty for most cases, but here incase you need persistent data binded to the class.)
        super();
    }

    /**
     * @method Register
     * @description A method of the Interaction class for registering the interaction with metadata.
     * @returns <InteractionRegister> (Enum).
     */
    override register(): InteractionRegister {
        // You may log any interactions here that needs to be instantiated before the execution starts.
        // You can think of this as the constructor of the class.
        // new Logger("Interaction Register - Base", true).log(LoggerType.ERROR, `${LC.FgRed}${LC.BgWhite}Instance has not been overidden.`)

        return {
            description: "Creates a prompt that registers a task.",
            name: "newtask",
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
    override execute(interaction: Interaction): void {
        // console.log(interaction.id);
        const modal = new Modal() // We create a Modal
            .setCustomId(`Slash.Newtask.${interaction.user.id}.Submit.NewTaskP1`)
            .setTitle('PoroBot New Task - Form 1')
            .addComponents(
              new TextInputComponent() // We create a Text Input Component
              .setCustomId('TaskName')
              .setLabel('Please provide a task name')
              .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
              .setMinLength(3)
              .setMaxLength(45)
              .setPlaceholder('Essay 1')
              .setRequired(true) // If it's required or not
            )
            .addComponents(
                new TextInputComponent() // We create a Text Input Component
                .setCustomId('TaskType')
                .setLabel('Type of Task')
                .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setMinLength(3)
                .setMaxLength(45)
                .setPlaceholder('Assignment')
                .setRequired(true) // If it's required or not 
            )
            .addComponents(
                new TextInputComponent() // We create a Text Input Component
                .setCustomId('ClassName')
                .setLabel('What is the class code?')
                .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setMinLength(3)
                .setMaxLength(30)
                .setPlaceholder('COMP-2022')
                .setRequired(true) // If it's required or not 
            )
            .addComponents(
                new TextInputComponent() // We create a Text Input Component
                .setCustomId('DueDate')
                .setLabel('What date is this task due?')
                .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setMinLength(5)
                .setMaxLength(5)
                .setPlaceholder('01/01 (DD/MM)')
                .setRequired(true) // If it's required or not 
            )
            .addComponents(
                new TextInputComponent() // We create a Text Input Component
                .setCustomId('DueTime')
                .setLabel('What time is this task due?')
                .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setMinLength(5)
                .setMaxLength(5)
                .setPlaceholder('21:00 (HH:MM) (24-hour format)')
                .setRequired(true) // If it's required or not 
            )

        showModal(modal, {
            client: interaction.client,
            interaction: interaction
        })
    }

    handlePerm(interaction: Interaction, member: GuildMember): boolean {
        if ((interaction as ButtonInteraction).customId.split('.')[2] === member.id) return true;
        return false;
    }

    handleButton(button: ButtonInteraction): void {
        const modalTemplate = new Modal() // We create a Modal
                .setCustomId(`Slash.Newtask.${button.user.id}.Submit.NewTaskP2.${button.customId.split('.')[5]}`)
                .setTitle('PoroBot New Task - Form 2')
                .addComponents(
                    new TextInputComponent() // We create a Text Input Component
                    .setCustomId('RubricLink')
                    .setLabel('Please provide the rubric link.')
                    .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                    .setMinLength(5)
                    .setMaxLength(220)
                    .setPlaceholder('https://google.com.au/submit')
                    .setRequired(false) // If it's required or not
                )
                .addComponents(
                    new TextInputComponent() // We create a Text Input Component
                    .setCustomId('SubmitLink')
                    .setLabel('Please provide the submission link.')
                    .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                    .setMinLength(5)
                    .setMaxLength(220)
                    .setPlaceholder('https://google.com.au/submit')
                    .setRequired(false) // If it's required or not 
                )

        showModal(modalTemplate, {
            client: button.client,
            interaction: button
        })
    }

    handleModal(modal: ModalSubmitInteraction): void {

        // Instantiate the UP factory.
        let UP = new UserProfile(modal.client, modal.user.id);
        let TM = new TaskManager(modal.client);

        switch(modal.customId.split('.')[4]) {
            case "NewTaskP1": {
                let taskid = `${modal.getTextInputValue("ClassName")}_${randomatic('0', 3)}`;

                TM.NewTask(taskid, modal.user.id, {
                    name: modal.getTextInputValue("TaskName"),
                    type: modal.getTextInputValue("TaskType"),
                    classId: modal.getTextInputValue("ClassName"),
                    activeState: ActiveState.PENDING,
                    submitLink: "https://google.com.au",
                    dueDate: new Date(new Date().getFullYear(), parseInt(modal.getTextInputValue("DueDate").split("/")[1]) - 1, parseInt(modal.getTextInputValue("DueDate").split("/")[0]), parseInt(modal.getTextInputValue("DueTime").split(":")[0]), parseInt(modal.getTextInputValue("DueTime").split(":")[1])),
                    rubricLink: ""
                });

                let embed = new MessageEmbed()
                    .setColor("GREEN")
                    .setDescription("Thank you for submitting **Form 1**!\n\nBy clicking on the button below, you will be filling out **Form 2**.\nThis is an optional form that enables you to hotlink the rubric and submission links to your task.")
                    .setFooter(`Your new task is ${taskid}.`);

                let comp = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setCustomId(`Slash.Newtask.${modal.user.id}.Show.NewTaskP2.${taskid}`)
                    .setStyle("PRIMARY")
                    .setLabel("Click to fill Form 2.")
                    .setEmoji("🔗")
                )
                
                modal.reply({embeds: [embed], components: [comp]})
                
                break;
            }
            case "NewTaskP2": {
                // Set the submission/rubric links and then finalise everything.
                TM.GetById(modal.customId.split('.')[5]).setRubricLink(modal.getTextInputValue("RubricLink"))
                TM.GetById(modal.customId.split('.')[5]).setSubmitLink(modal.getTextInputValue("SubmitLink"))

                let embed = new MessageEmbed()
                    .setColor("GREEN")
                    .setDescription(`Task **${modal.customId.split('.')[5]}** has been successfully created!`)
                
                modal.reply({ephemeral: true, embeds: [embed]})
                break;
            }
        }
    }
}