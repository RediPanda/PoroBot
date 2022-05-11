import dayjs from 'dayjs';
import type { Client, TextChannel, Webhook } from 'discord.js';
import { Logger, LoggerType } from '../IO/Logger';

/**
 * @description This file is responsible for holding miscellaneous functions that cannot be orientated as factories or fit into the FS subsets.
 */
export class Utility {
    client: Client;
    logger: Logger;

    constructor(client: Client) {
        this.client = client;
        this.logger = new Logger("Utility", true)
    }

    /**
     * Toast Message utility will return a greeting string based on the time of day.
     * @returns 3 possible states.
     */
    getToastMessage(): string {
        if (dayjs().hour() > 17) {
            return "Good evening";
        }

        if (dayjs().hour() > 11) {
            return "Good afternoon";
        } else {
            return "Good morning";
        }
    }
}