import type { AkairoClient } from 'discord-akairo';
import type { Message, MessageOptions, TextChannel } from 'discord.js';
import {env} from 'process';
import { WebhookManager } from '../Factory/Webhook';

/**
 * The Storage class is responsible for handling persistent data, both on local and remote data buffers.
 * @exports
 * @class Storage
 */
export class Notify {
    private client: AkairoClient;
    private channel: NotifyChannel;
    private guild: string;

    constructor(client: AkairoClient, channel: NotifyChannel) {
        this.client = client;
        this.channel = channel;
        this.guild = "917479312825933884";
    }

    // Sends with Message Object payload.
    public async send(msgobj: MessageOptions): Promise<void> {
        let webhook = new WebhookManager(this.client, env[this.channel] as unknown as string)
        return await webhook.send(msgobj);
    }
}

export enum NotifyChannel {
    BotLogs = "WEBHOOK_BOTLOGS"
}