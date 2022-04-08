import { Listener } from "discord-akairo";
import { Logger, LoggerType } from "../Framework/IO/Logger";
import type { ModalSubmitInteraction } from "discord-modals";
import path from "path";

export default class InteractionModalListener extends Listener {
    constructor() {
        super('InteractionModalListener', {
            emitter: 'client',
            event: 'modalSubmit'
        });
    }

    override async exec(modal: ModalSubmitInteraction): Promise<void> {
        const ListenLogger = new Logger("Events - Interactions", true)
        ListenLogger.log(LoggerType.DEBUG, `Interaction received <- [${modal.customId.split('.')[1]} from ${modal.customId.split('.')[0]}] [Type: ${modal.customId.split('.')[3]}]`)

        let botPath = 'src';
        if (process.env.NODE_ENV === 'production') botPath = 'dist'

        // Always Disable.
        if (modal.customId === "Disabled") return;
            
        let filepath: string = "";
        let actions: string[] = modal.customId.split('.');


        switch(actions[0]) {
            case "Context_User": {
                filepath = path.join(process.cwd(), `${botPath}`, 'Interactions', 'Context', 'User', `${(actions[1]).replace(/ /ig, "_")}`);
                break;
            }
            case "Context_Message": {
                filepath = path.join(process.cwd(), `${botPath}`, 'Interactions', 'Context', 'Message', `${(actions[1]).replace(/ /ig, "_")}`);
                break;
            }
            case "Slash": {
                filepath = path.join(process.cwd(), `${botPath}`, 'Interactions', 'Slash', `${(actions[1]).replace(/ /ig, "_")}`);
                break;
            }
            case "Event": {
                filepath = path.join(process.cwd(), `${botPath}`, 'Listeners', `${(actions[1]).replace(/ /ig, "_")}`);
                break;
            }
        }

        try {
            const instance = await import(filepath);
            const cmd = await new instance.default()
            if (await cmd.handlePerm(modal, modal.member) === true) cmd.handleModal(modal);
            else this.client.events.emit('INT_BLOCKED', modal, toTitleCase(actions[1]));
        } catch(err: unknown) {
            ListenLogger.log(LoggerType.ERROR, `${err}`);
            modal.reply({content: "This interaction is not available!", ephemeral: true})
        }
    }
}

function toTitleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}