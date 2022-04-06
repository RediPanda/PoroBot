import type { ApplicationCommandType, Guild, GuildMember, Interaction } from "discord.js";
import { Logger, LoggerType, LC } from "../../../Framework/IO/Logger";

export interface InteractionRegister {
    description?: string,
    name: string,
    type: ApplicationCommandType
}

/**
 * @class Interaction Event.
 * @description This is the base Class. New Interactions should extend upon this class.
 */
export default class InteractionEvent {
    id: string;
    logger: Logger;
    constructor() {
        // NOOP. (Empty for most cases, but here incase you need persistent data binded to the class.)
        this.id = "Base";
        this.logger = new Logger(`Interaction - ${this.constructor.name}`, true)
    }

    /**
     * @method Register
     * @description A method of the Interaction class for registering the interaction with metadata.
     * @returns <InteractionRegister> (Enum).
     */
    register(): InteractionRegister {
        // You may log any interactions here that needs to be instantiated before the execution starts.
        // You can think of this as the constructor of the class.
        new Logger("Interaction Register - Base", true).log(LoggerType.WARN, `${LC.FgRed}${LC.BgWhite}Instance has not been overidden.`)

        return {
            // description: "This is a base interaction.",
            name: "BASE",
            type: "USER"
        }
    }

    /**
     * @method interactionPerm
     * @description A method for determining whether the interaction should be handled or not.
     * @param member Guild Member instance.
     * @returns boolean.
     */
    async interactionPerm(member: GuildMember): Promise<boolean> {
        // This supports promises!
        console.log(member.id);
        return await true;
    }

    /**
     * @method handlePerm
     * @description A method for determining whether there should be pre-flight checks before sending to the handler.
     * @param interaction Interaction of the handler.
     * @param member Guild Member of the interactor.
     * @returns boolean
     */
    async handlePerm(interaction: Interaction, member: GuildMember): Promise<boolean> {
        return await true;
    }

    /**
     * @method Execute
     * @description The main driver of the class.
     * @param interaction Interaction of the event emitted.
     * @returns void
     */
    // You will need to cast the Interaction type to your needs since the listener handler already manages this. (For Intellisense)
    execute(interaction: Interaction): void {
        console.log(interaction.id);
        throw new Error("PROTOCOL NOT OVERRIDDEN");
    }

    /**
     * @method handleInteraction
     * @description The function that handles side interactions (Buttons and Select Menus.)
     * @param interaction Interaction of the event emitted.
     * @returns void
     */
    handleInteraction(interaction: Interaction): void {
        console.log(interaction.id);
        throw new Error("PROTOCOL NOT OVERRIDDEN");
    }
}