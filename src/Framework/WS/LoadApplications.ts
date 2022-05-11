/**
 * This file is designed to handle applications set for the bot's interface.
 */

import type { AkairoClient } from "discord-akairo";
import type { ApplicationCommandData, Client } from "discord.js";
import { Logger, LoggerType } from "../IO/Logger";
import { readdirSync } from "fs";
import path from 'path';
declare module "discord-akairo" {
    interface AkairoClient {
        botDir: string
    }
}
export class ApplicationHandler {
    client: Client;
    location: string;
    logger: Logger;

    constructor(client: Client) {
        this.logger = new Logger("Framework - AppReg", true);
        this.client = client;
        this.location = (client as AkairoClient).botDir;
    }

    /**
     * @method readApp();
     * @description Reads and applies all Application-files in a specified directory.
     */
    public async readInteractions(): Promise<void> {
        const services = [
            {
                id: "Context_USER", 
                path: ["Context", "User"],
                type: "USER"
            }, 
            {
                id: "Context_MESSAGE", 
                path: ["Context", "Message"],
                type: "MESSAGE"
            },
            // { Removed as it is deemed unnecessary as of now.
            //     id: "Select", 
            //     path: ["Select"]
            // },
            {
                id: "Slash", 
                path: ["Slash"],
                type: "CHAT_INPUT"
            }
        ];

        this.logger.log(LoggerType.DEBUG, "Attempting to read and apply interaction registers...");

        for (let i = 0; i < services.length; i++) {
            let intpath;
            if (services[i].path[0] === "Context") intpath = path.join(process.cwd(), this.location, "Interactions", "Context", services[i].path[1]);
            else intpath = path.join(process.cwd(), this.location, "Interactions", services[i].path[0]);
            
            this.logger.log(LoggerType.DEBUG, "[READ]: Reading service type: " + services[i].id);
            const dirContent = readdirSync(intpath)
            
            for (const file of dirContent) {
                try {
                    if (file !== "Base.ts" && file !== "Base.js") {
                        // Filter out source maps.
                        if (file.split('.').length > 2) return;

                        this.logger.log(LoggerType.DEBUG, "[READ]: Reading service - " + file);

                        const exec = await import(`${path.join(intpath, file)}`);
                        const instance = new exec.default();

                        this.register(instance.register())
                    }
                } catch(err) {
                    this.logger.log(LoggerType.ERROR, (err as string));
                }
            }
        }
    }

    private async register(meta: ApplicationCommandData): Promise<void> {
        try {
            this.client.guilds.cache.forEach(async (g) => {
                try {
                    this.logger.log(LoggerType.DEBUG, `  ╰  Registered to (${g.id})`)
                    await this.client.application?.commands.create(meta, g.id);
                } catch(err) {
                    this.logger.log(LoggerType.ERROR, "There was an issue trying to register interaction - " + meta.name + " [" + meta.type + "].");
                    this.logger.log(LoggerType.ERROR, (err as string));
                }
            });
        } catch(err) {
            this.logger.log(LoggerType.ERROR, (err as string));
        }
    }
}