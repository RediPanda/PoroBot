import type { Client, TextChannel, Webhook } from 'discord.js';
import { Storage, StorageType } from "../IO/Storage";

/**
 * @class SettingsManager
 * @description Responsible for pulling and setting variables both runtime and startup.
 */
export class SettingsManager {
    client: Client;
    settings: Storage; // Persistence controller.

    constructor(client: Client) {
        this.client = client;
        this.settings = new Storage().select(StorageType.Client);
    }

    /* Gets a specific property from the settings table. */
    get(property: string): any {
        return this.settings.get(property) || false;
    }

    /* Sets a specific property to the settings table. */
    set(property: string, value: any): void {
        this.settings.set(property, value);
    }

    /* Displays a table-ised list of properties available to the console. */
    table(): void {
        let output: { id: string | number; data: any; }[] = [];
        let values = this.settings.stream().array();
        let props = this.settings.stream().keyArray();

        // Align props to their obj values to an empty array.
        for (let i = 0; i < values.length; i++) {
            output.push({id: props[i], data: values[i]});
        }

        console.table(output);
    }

    /* Appends to a randomized file with the content and returns the file name. */
    tableAsFile(): string {
        return '';
    }
}