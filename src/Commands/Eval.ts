import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "discord-akairo";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import { performance } from "node:perf_hooks";
import util from "util";

interface EvalContent {
    output: unknown;
    errored: boolean;
}

export default class EvalCommand extends Command {
    slashType: string;

    constructor() {
        super('eval', {
            aliases: ['eval', 'e'],
            args: [
                {
                    id: 'code',
                    match: 'content'
                }
            ],
            category: 'owner',
            ownerOnly: true,
            quoted: false,
        });

        this.slashType = "GUILD"
    }

    override async exec(message: Message, { code }: { code: string} ): Promise<Message | undefined> {
        if (!code) return message.reply('No code provided!');

        const before = performance.now()
        const evalObj = await this.evaluate(message, code);
        
        // Performance timer code.
        const duration = performance.now() - before;
        let durOutput: string;

        if (duration < 1000) {
            durOutput = `${duration.toFixed(2)}ms`;
        } else {
            durOutput = `${(duration / 1000).toFixed(2)}s`;
        }

        const Embed = new MessageEmbed();
        Embed.setTitle("Developer Panel");
        Embed.setColor(evalObj.errored ? 'RED' : 'GREEN')
        Embed.addField("Developer Evaluation:", "```" + code + "```", false);
        Embed.addField(`Computation Result ⎯⎯⎯⎯⎯⎯⎯ [⏱️ ${durOutput}]:`, "```" + evalObj.output + "```", false);
        Embed.setTimestamp()

        message.reply({embeds: [Embed]})
    }

    async evaluate(message: Message, code: string): Promise<EvalContent> {
        const evaled: EvalContent = {
            errored: false,
            output: 'empty'
        };
        const logs: string[] = [];
        const token = message?.client?.token?.split('').join('[^]{0,2}');
        const rev = message?.client?.token?.split('').reverse().join('[^]{0,2}');
        const tokenRegex = new RegExp(`${token}|${rev}`, 'g');

        try {
            let output = eval(code);
            if (output && typeof output.then === 'function') output = await output;

            if (typeof output !== 'string') output = util.inspect(output, { depth: 0 });
            output = `${logs.join('\n')}\n${logs.length && output === 'undefined' ? '' : output}`;
            output = output.replace(tokenRegex, '[TOKEN]');

            if (output.length + code.length > 1900) output = 'Output too long.';

            evaled.errored = false;
            evaled.output = output;

            return evaled;
        } catch (err) {
            let error = err;

            if (err instanceof Error) {
                error = err.toString();
                error = `${logs.join('\n')}\n${logs.length && error === 'undefined' ? '' : error}`;
                error = err.toString().replace(tokenRegex, '[TOKEN]');

                console.log(">>>>>>>>>>>>>>   DEVELOPER EVALUATION    >>>>>>>>>>")
                console.error(err); // eslint-disable-line no-console
                console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n\n")
    
                evaled.errored = true;
                evaled.output = error;
            }

            return evaled;
        }
    }

    async interaction(interaction: CommandInteraction): Promise<void> {
        const payload = new MessageEmbed().setColor('RED').setDescription('This command is not available through interactions.')
        interaction.reply({embeds: [payload]});
    }

    async interactionPerm(): Promise<boolean> {
        return await false;
    }

    getSlashData(): SlashCommandBuilder {
        return new SlashCommandBuilder()
                .setName('eval')
                .setDescription('Evaluation protocol.');
    }
}