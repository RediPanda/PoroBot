import { Client, Message, MessageEmbed, MessageOptions, WebhookClient } from "discord.js";

export class WebhookManager {
    private client: Client;
    private url: string;
    private id: string;
    private token: string;
    private webhook: WebhookClient;

    constructor(client: Client, url: string) {
        this.client = client;
        this.url = url;
        this.id = url.split('/')[5]
        this.token = url.split('/')[6]
        this.webhook = new WebhookClient({id: this.id, token: this.token})
    }

    public async send(obj: MessageOptions): Promise<void> {
        await this.webhook.send(obj);
    }

    public async sendRaw(data: string): Promise<void> {
        await this.webhook.send({content: data})
    }

    public async sendEmbed(data: MessageEmbed):Promise<void> {
        await this.webhook.send({embeds: [data]})
    }
}