import type { ApplicationCommandType, GuildMember, Interaction } from "discord.js";
import { Logger, LoggerType, LC } from "../../Framework/IO/Logger";
import InteractionEvent from "./Base";
import { Modal, TextInputComponent, showModal, ModalSubmitInteraction } from 'discord-modals'
import { UserProfile } from "../../Framework/Factory/UserProfile";

export interface InteractionRegister {
    description?: string,
    name: string,
    type: ApplicationCommandType
}

/**
 * @class Interaction Event.
 * @description This is the base Class. New Interactions should extend upon this class.
 */
export default class StartSession extends InteractionEvent {
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
            description: "Creates a prompt that starts the weekly notification system.",
            name: "startsession",
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
        const modal = new Modal() // We create a Modal
            .setCustomId(`Slash.Startsession.${interaction.user.id}.Submit.NewSession`)
            .setTitle('PoroBot New Session Form!')
            .addComponents(
              new TextInputComponent() // We create a Text Input Component
              .setCustomId('CurrentWeek')
              .setLabel('What week are you currently in?')
              .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
              .setMinLength(1)
              .setMaxLength(2)
              .setPlaceholder('1-99')
              .setRequired(true) // If it's required or not
            )
            .addComponents(
                new TextInputComponent() // We create a Text Input Component
                .setCustomId('MaxWeek')
                .setLabel('How many weeks does this session have?')
                .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setMinLength(1)
                .setMaxLength(2)
                .setPlaceholder('2-99')
                .setRequired(true) // If it's required or not 
            )
            .addComponents(
                new TextInputComponent() // We create a Text Input Component
                .setCustomId('HexColor')
                .setLabel('What color would you like your notifications?')
                .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setMinLength(7)
                .setMaxLength(7)
                .setPlaceholder('#5865F2')
                .setRequired(false) // If it's required or not 
            )

        // console.log(interaction.id);
        showModal(modal, {
            client: interaction.client,
            interaction: interaction
        })
    }

    handlePerm(): boolean {
        return true;
    }

    handleModal(modal: ModalSubmitInteraction): void {
        // We handle the actual week setup here.
        let UP = new UserProfile(modal.client, modal.user.id);

        UP.SetWeek(parseInt(modal.getTextInputValue("CurrentWeek"))); // Sets the current week ticker.
        UP.SetWeekMax(parseInt(modal.getTextInputValue("MaxWeek"))); // Sets the maximum week.

        // Yayyyy, now tell the user they can add tasks now to the system.
        modal.reply("Week data was successful!")
    }
}