import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from'dayjs/plugin/timezone';
dayjs.extend(utc)
dayjs.extend(timezone)

import type { Client, TextChannel, Webhook } from 'discord.js';
import { Logger, LoggerType } from '../IO/Logger';

/**
 * @description This file is responsible for holding miscellaneous functions that cannot be orientated as factories or fit into the FS subsets.
 */
export class Utility {
    client: Client;
    logger: Logger;
    timezone: string;

    constructor(client: Client) {
        this.client = client;
        this.logger = new Logger("Utility", true)

        this.timezone = "Australia/Sydney";
    }

    /**
     * Toast Message utility will return a greeting string based on the time of day.
     * @returns 3 possible states.
     */
    getToastMessage(): string {
        let timenow = dayjs().tz(this.timezone);
        
        if (timenow.hour() > 17) {
            return "Good evening";
        }

        if (timenow.hour() > 11) {
            return "Good afternoon";
        } else {
            return "Good morning";
        }
    }
}