import { Client, Message, MessageEmbed, TextChannel, User } from 'discord.js';
import { Logger, LoggerType } from '../IO/Logger';
import { Storage, StorageType } from '../IO/Storage';
import random from 'randomatic';

interface ModLogOptions {
    default: true,
    message: Message,
    duration: string
    args: {
        target: User,
        reason: string
    }
}

interface ModData {
    chanid: string
}

export class GuildManager {
    client: Client;
    serverid: string;

    constructor(client: Client, serverid: string) {
        this.client = client;
        this.serverid = serverid;

        if (process.env.NODE_ENV === 'development') new Logger("GuildManager", true).log(LoggerType.DEBUG, `Instating the GuildManager class structure for ${serverid}.`)
    }

    /**
     * Send Error Report
     * @description Sends a report to the client, the logging system and to the end user.
     * @param {Message} message 
     * @param {String} cmd 
     * @param {String} content 
     */
    sendErrorReport(message: Message, cmd = "NULL_CMD", content = "The provider has no content to show."): void {
        const report = new MessageEmbed();

        const id1 = random('Aa0', 5);
        const id2 = random('Aa0', 5);

        // Send report to the end user.
        report.setColor("RED")
        report.setDescription("An error has occured. Please try again at a later time!")
        report.setFooter(`If the problem persists, please contact the Server Administrators. [core-${id1}-${id2}]`)
        message?.channel.send({embeds: [report]})

        // Report error via log-based file system.
        const Reporter = new Logger("Error Reporter", true, 'error_stack')
        Reporter.log(LoggerType.ERROR, `[GENERATED ERROR REPORT - [nekocore-${id1}-${id2}]]`)
        Reporter.log(LoggerType.ERROR, "---- SOURCE: " + cmd)
        Reporter.log(LoggerType.ERROR, "---- - STACK TRACE:")
        Reporter.log(LoggerType.ERROR, content)
    }

    /**
     * Send Moderation Logs
     * @description Responsible for logging moderation-related events to Guilds.
     * @param {String} type Type of Event
     * @param {Object} options Options Object
     * @param options.message Message Object (Discord.JS)
     * @param options.args Argument Constructor (Client)
     * @param options.duration Custom Client Input (Command Handler)
     */
    sendModLog(type: string, options: ModLogOptions): Promise<Message> | void {
        if (options.default) return new Logger("[Guild_MogLogs]").log(LoggerType.WARN, "The method you are using is missing an options parameter.");

        const logframe = new MessageEmbed();

        switch (type.toLowerCase()) {
            case 'warn':
                logframe.setTitle(`User was warned`);
                logframe.setColor('YELLOW')

                // Add fields.
                logframe.addField('Staff:', `${options.message.member} (${options.message.author.tag})`, true)
                logframe.addField('User:', `${options.args.target} (${options.args.target.tag})`, true)
                logframe.addField('Reason:', `${options.args.reason || "No reason provided."}`, false)
                break;
            case 'kick':
                logframe.setTitle(`User was kicked`)
                logframe.setColor('ORANGE')

                // Add fields.
                logframe.addField('Staff:', `${options.message.member} (${options.message.author.tag})`, true)
                logframe.addField('User:', `${options.args.target} (${options.args.target.tag})`, true)
                logframe.addField('Reason:', `${options.args.reason || "No reason provided."}`, false)
                break;
            case 'ban':
                logframe.setTitle(`User was banned`)
                logframe.setColor('RED')

                // Add fields.
                logframe.addField('Staff:', `${options.message.member} (${options.message.author.tag})`, true)
                logframe.addField('User:', `${options.args.target} (${options.args.target.tag})`, true)
                logframe.addField('Reason:', `${options.args.reason || "No reason provided."}`, false)
                break;
            case 'mute':
                logframe.setTitle(`User was muted`)
                logframe.setColor('BLUE')

                // Add fields.
                logframe.addField('Staff:', `${options.message.member} (${options.message.author.tag})`, true)
                logframe.addField('User:', `${options.args.target} (${options.args.target.tag})`, true)
                logframe.addField('Duration:', `**${options.duration || "Indefinitely"}**`, false)
                logframe.addField('Reason:', `${options.args.reason || "No reason provided."}`, false)
                break;
        }

        const chanid = (new Storage().select(StorageType.Server).get(this.serverid)?.mod as ModData)?.chanid;
        // return console.log(chanid)
        
        return (options!.message!.guild!.channels!.cache!.get(chanid) as TextChannel)!.send({embeds: [logframe]});
    }
}