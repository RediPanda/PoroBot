import { Listener } from "discord-akairo";
import { Client, ColorResolvable, MessageEmbed } from "discord.js";
import { Logger, LoggerType } from "../Framework/IO/Logger";
import { Storage, StorageType } from "../Framework/IO/Storage";
import dayjs from "dayjs";
import { UserProfile } from "../Framework/Factory/UserProfile";
import { TaskManager } from "../Framework/Factory/Task";
import type { AkairoClient } from "discord-akairo";
import duration from "dayjs/plugin/duration";
import RelativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(RelativeTime);

export default class InternalClock extends Listener {
    constructor() {
        super('InternalClock', {
            emitter: 'client',
            event: 'ready'
        });
    }

    override async exec(client: Client): Promise<void> {
        const ListenLogger = new Logger("Events - Clock", true);
        ListenLogger.log(LoggerType.DEBUG, `Event received <- ['Status': InternalClock]!`);

        // This event is responsible for handling any notifications.
        /**
         * As of now, it is solely responsible for the following notifications to be dispatched.
         *  Week starting notifications (To arrive on Mondays 7AM).
         *   - To add on top of this notification, will include the highlight of the week. This will list all tasks in the week.
         */

        setInterval(async () => {
            const time = dayjs();
            if (time.hour() === 20 && time.minute() === 0) {  // 1-7-0 //  && time.minute() === 27
                let registered = new Storage().select(StorageType.User).stream().keyArray();

                for (let i = 0; i < registered.length; i++) {
                    let id = (registered[i] as string).split('.')[0];

                    let UP = new UserProfile(client, id);
                    let TM = new TaskManager(client);
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
                            tasks = `You have no tasks due in 2 weeks. You are up to date! ${(client as AkairoClient).getEmoji('kleeexcited')}`
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
        }, 6000) // Loops on a minute basisset
    }
}