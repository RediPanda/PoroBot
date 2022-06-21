// This script is only designed to deploy slash commands on a global scale. Not for per-guild usage.
// This script is a heavily modified version of https://discordjs.guide/interactions/registering-slash-commands.html#guild-commands
import {config} from 'dotenv'
config();

import { Logger, LoggerType } from '../IO/Logger';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { readdirSync } from 'fs';
import path from 'path';

const appId = '919172638327312456'; // Application ID of the bot.
const guilds = ['917479312825933884', '687580684797345792'];

// Declaring an empty array for SlashBuilder bodies.
const logger = new Logger('Slash Deploy', true, 'Slash Deploy');
const globalSlash: any[] = [];
const guildSlash: any[] = [];

// Retrieves all TS files.
const commandList = readdirSync(path.join(process.cwd(), 'src', 'Commands')).filter(f => f.endsWith('.ts'));

// Collating all available slash commands for global.
(async () => {
    for (const command of commandList) {
        const commandFile = await import(`${path.join(process.cwd(), 'src', 'Commands', command)}`);

        const commandSlashMeta = new commandFile.default()
        const slashAcquire = commandSlashMeta.getSlashData().toJSON();
        if (commandSlashMeta.slashType === 'GLOBAL') globalSlash.push(slashAcquire);
        if (commandSlashMeta.slashType === 'GUILD') guildSlash.push(slashAcquire)
    }

    // All global commands are appended to the array. Send data to Discord.
    const rest = new REST({ version: '9'}).setToken(`${process.env.AUTHORISATION}`);

    try {
        // PUT global slash commands.
        logger.log(LoggerType.DATA, 'Refreshing all global [/] commands.');

        await rest.put(
            Routes.applicationCommands(appId),
            { body: globalSlash }
        );
        logger.log(LoggerType.DATA, `A total of ${globalSlash.length} global [/] commands have been posted!`)

        // PUT guild slash commands.
        logger.log(LoggerType.DATA, 'Refreshing all guild [/] commands.');

        for (let i = 0; i < guilds.length; i++) {
            await rest.put(
                Routes.applicationGuildCommands(appId, guilds[i]),
                { body: guildSlash }
            );
        }

        logger.log(LoggerType.DATA, `A total of ${guildSlash.length} guild [/] commands have been posted!`)
    } catch (err) {
        logger.log(LoggerType.ERROR, 'There was an error uploading the new slash commands.')
        logger.log(LoggerType.ERROR, `${err}`);
    }
})();
