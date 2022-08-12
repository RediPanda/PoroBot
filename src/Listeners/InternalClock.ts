import { Listener } from "discord-akairo";
import { Client, ColorResolvable, MessageEmbed } from "discord.js";
import { Logger, LoggerType } from "../Framework/IO/Logger";
import { Storage, StorageType } from "../Framework/IO/Storage";
import dayjs from "dayjs";
import { UserProfile } from "../Framework/Factory/UserProfile";
import { TaskManager, Task, ActiveState } from "../Framework/Factory/Task";
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

        /**
         * This loop is responsible for handling (Submitted and Past Cur Date) tasks from the main stream.
         */

        setInterval(async () => {
          // const time = dayjs()
          const TM = new TaskManager(client);
          ListenLogger.log(LoggerType.DEBUG, `Running (Cleanup) cycle.`);

          let stream = new Storage().select(StorageType.Task).stream();
          let tasks = stream.keyArray();
          
          for (let i = 0; i < tasks.length; i++) {
            // Run the cleanup task per task.
            if (TM.GetById(tasks[i] as string).getActiveState() === ActiveState.SUBMITTED && TM.GetById(tasks[i] as string).getDueDate().getTime() <= new Date().getTime()) {
              // Remove the task from the system.
              ListenLogger.log(LoggerType.DATA, `Successfully removed Task (${tasks[i]} - ${TM.GetById(tasks[i] as string).getName()}) from the data pool.`);
              stream.delete(tasks[i]);
            }
          }

        }, 2500) // 12 hours cycle. (12 * 60 * 60 * 1000)

        /**
          * This loop is responsible for handling any tasks that are not marked as "SUBMITTED" and time-wise, overdue.
          */
        setInterval(async () => {
          const TM = new TaskManager(client);
          ListenLogger.log(LoggerType.DEBUG, `Running the overdue mark cycle.`);

          let customMsg = [
            "HURRY YO BITCH ASS UP, THOSE GRADES AINT MAKING THEMSELVES",
            "Mumma gonna be so DISAPOINTED",
            "I bet that 3-year coffee break is good huh",
            "STOP PLAYING WITH YO DIC",
            "*sniff... sniff...* I can smell procrastination",
            "Only furrys have over-due assignments -_-, are you a furry?",
            "B+ AGAIN??",
            "insert PTSD of disappointed Asian dad",
            "watch it, you wont: https://youtu.be/ZXsQAXx_ao0",
            "PUT THE PENIS AWAY AND START STUDYING",
            "Even Jesus is disappointed",
            "Cmon...If Anya can do it, you can do it too",
            "DO THE ASSIGNMENT, NO MAIDEN WANTS A DUMB DUMB",
            "Do the assignment or suck my toes, the choice is yours"
          ]

          let stream = new Storage().select(StorageType.Task).stream();
          let tasks = stream.keyArray();

          for (let i = 0; i < tasks.length; i++) {
            let task = TM.GetById(tasks[i] as string);

            if (task.getDueDate().getTime() <= new Date().getTime() && (task.getActiveState() !== ActiveState.OVERDUE && task.getActiveState() !== ActiveState.SUBMITTED)) {
              // Send the task owner a notif via DM.
              ListenLogger.log(LoggerType.DATA, `Task (${tasks[i]} | ${task.getName()}) is marked as overdue!`);
              let owner = await client.users.fetch(task.getOwner());

              let embed = new MessageEmbed();
              embed.setColor("RED");
              embed.setFooter(customMsg[Math.floor(Math.random() * customMsg.length)]);
              embed.setDescription(`${(client as AkairoClient).getEmoji("warning")} **[${task.getClassId()}] ${task.getName()}** (${task.getId()}) is now overdue!`);

              owner.send({embeds: [embed]})

              // Mark the task in the DB as overdue.
              task.setActiveState(ActiveState.OVERDUE);
            }
          }


        }, 1 * 10 * 1000) // Should run every 10 seconds.

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
        }, 31000) // Loops on a 31s loop.
    }
}
