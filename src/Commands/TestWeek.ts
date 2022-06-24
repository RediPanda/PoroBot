import { Command } from "discord-akairo";
import type { CommandInteraction, Message } from "discord.js";
import { Client, ColorResolvable, MessageEmbed } from "discord.js";
import { Storage, StorageType } from "../Framework/IO/Storage";
import dayjs from "dayjs";
import { UserProfile } from "../Framework/Factory/UserProfile";
import { TaskManager } from "../Framework/Factory/Task";
import type { AkairoClient } from "discord-akairo";
import duration from "dayjs/plugin/duration";
import RelativeTime from "dayjs/plugin/relativeTime";
const { SlashCommandBuilder } = require('@discordjs/builders');

export default class TestWeekCMD extends Command {
    slashType: string;

    constructor() {
        super('testweek', {
            aliases: ['testweek']
        });

        this.slashType = "GUILD"; // GUILD/GLOBAL.
    }

    override async exec(message: Message): Promise<void> {
        let registered = new Storage().select(StorageType.User).stream().keyArray();
                //console.log(registered)
                //console.log(registered.length)

                for (let i = 0; i < registered.length; i++) {
                    let id = (registered[i] as string).split('.')[0];

                    let UP = new UserProfile(message.client, id);
                    let TM = new TaskManager(message.client);
                    if (UP.GetWeek() < UP.GetMaxWeek()) {
                        // Start the new week via incremented.
                        UP.IncrementWeek();
                        
                        let webhook = await UP.AbstractWebhook();
                        let content = `**Welcome to Week ${UP.GetWeek()}**\n`;
                        content += "\nAccumulated Study time: `" + dayjs.duration({seconds: UP.GetStatData()?.cumulative_study as number || 0}).humanize() + "`";
                        content += "\nAccumulated Break time: `" + dayjs.duration({seconds: UP.GetStatData()?.cumulative_break as number || 0}).humanize() + "`";

                        let tasks = ``;
                        let weektaskdata = TM.GetTasksInTwoWeek(id);

                        if (weektaskdata.length > 0) {
                            // Append into the content variable.
                            for (let i = 0; i < weektaskdata.length; i++) {
                                tasks += `\`${weektaskdata[i].getActiveState()}\` **[${weektaskdata[i].getClassId()}]** - [${weektaskdata[i].getName()}](${weektaskdata[i].getRubricLink() || "https://google.com.au"} "${weektaskdata[i].getId()}") - (<t:${dayjs(weektaskdata[i].getDueDate()).unix()}:R>) [(Submit?)](${weektaskdata[i].getSubmitLink()} "Submission link")\n`
                            }
                        } else {
                            tasks = `You have no tasks due in 2 weeks. You are up to date! ${(message.client as AkairoClient).getEmoji('kleeexcited')}`
                        }

                        let embed = new MessageEmbed()
                            .setColor(UP.GetColor() as ColorResolvable)
                            .setDescription(content)
                            .setThumbnail(webhook.avatarURL() as string)
                            .addField(`Upcoming Tasks ―― [${weektaskdata.length}]`, tasks);

                        webhook.send({embeds: [embed]});
                    }
                }
    }

    async interactionPerm(): Promise<boolean> {
        return await true;
    }

    async interaction(interaction: CommandInteraction): Promise<void> {
        interaction.reply("ping.")
    }
 
    getSlashData(): any {
        return new SlashCommandBuilder()
                .setName('testweek')
                .setDescription('Ping the bot!');
    }
}