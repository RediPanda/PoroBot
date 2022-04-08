import type { Client, TextChannel, Webhook } from 'discord.js';
import { Logger, LoggerType } from '../IO/Logger';
import { Storage, StorageType, StorageParam } from '../IO/Storage';
import dayjs from 'dayjs';

export class UserProfile {
    client: Client;
    userid: string;
    storage: Storage
    data: UserProfileModel
    logger: Logger

    constructor(client: Client, userid: string) {
        this.client = client;
        this.userid = userid;
        this.storage = new Storage({server: '0', user: userid}).select(StorageType.User);
        this.data = new Storage({server: '0', user: userid}).select(StorageType.User).get("profile") || {};
        this.logger = new Logger("UserProfiler", true)

        if (process.env.NODE_ENV === 'development') this.logger.log(LoggerType.DEBUG, `Instating the UserProfile class structure for ${userid}.`)
    }

    /**
     * Creates a Webhook tailored and binded to the UserProfile.
     * If a webhook exists, return an existing webhook object.
     */
    async AbstractWebhook(avatar?: string): Promise<Webhook> {
        let user = (await this.client.guilds.cache.get(process.env.GUILD as string)?.members.fetch(this.userid))?.displayName || "No Name";

        let notification_chn_id = new Storage({server: '0', user: '0'}).select(StorageType.Client).get('notif_chn');
        let notification_chn = await this.client.guilds.cache.get(process.env.GUILD as string)?.channels.fetch(notification_chn_id)

        if (!(await (notification_chn as TextChannel).fetchWebhooks()).has(this.data.webhookID)) { // Create and assign webhook URL profiling.
            let webhookClient = await (notification_chn as TextChannel).createWebhook(user, {
                avatar: avatar || 'https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/bltf9011394eb293887/609ae4498c053e542a586626/WRRainbowPoro_512.jpg',
                reason: "User Profile generation."
            })

            this.storage.set("profile", webhookClient.id, "webhookID");

            return webhookClient;
        } else {
            return (await notification_chn?.guild.fetchWebhooks())?.get(this.data.webhookID) as Webhook
        }
    }

    /**
     * Measurement Method for all Statistical data.
     * @param action Measurement action (start/stop)
     * @param type Measurement profile type.
     */
    MeasureStatistics(action: Status, type: MetricType): void {
        switch(action) {
            case Status.RESET: {
                this.logger.log(LoggerType.DATA, `Statistical telemetry data for ${this.userid} has been reset.`)
                this.storage.set("profile", dayjs().unix(), "statistics.time_measurement." + `${type}_last`);
                this.storage.set("profile", Status.AVAILABLE, "statistics.time_measurement." + `${type}_status`);
                this.storage.set("profile", 0, "statistics." + `cumulative_${type}`);
                break;
            }
            case Status.AVAILABLE: {
                // Calculate difference first.
                // Now calculate and append the cumulative time value.
                let time = this.storage.get("profile").statistics[`cumulative_${type}`] || 0;
                time += (dayjs().unix() - (dayjs.unix(this.storage.get("profile").statistics.time_measurement[`${type}_last`])).unix());
                this.logger.log(LoggerType.DEBUG, `Calculated time = ${(dayjs().unix() - (dayjs.unix(this.storage.get("profile").statistics.time_measurement[`${type}_last`])).unix())} seconds`)

                // We are coming back from the MEASURE state, so we can stop the update and calculate the cumulative.
                this.storage.set("profile", dayjs().unix(), "statistics.time_measurement." + `${type}_last`);
                this.storage.set("profile", Status.AVAILABLE, "statistics.time_measurement." + `${type}_status`);
                this.storage.set("profile", time, "statistics." + `cumulative_${type}`);
                break;
            }
            case Status.MEASURING: {
                // Starting the measurement system. Set everything necessary.
                // Remove duplicate measuring requests.
                if (this.storage.get("profile").statistics.time_measurement[type + "_status"] === Status.MEASURING) return;

                this.logger.log(LoggerType.DATA, "Start Measuring metrics.")
                this.storage.set("profile", dayjs().unix(), "statistics.time_measurement." + `${type}_last`);
                this.storage.set("profile", Status.MEASURING, "statistics.time_measurement." + `${type}_status`);
                break;
            }
        }
        return;
    }

    /**
     * Overwrites the internal storage system by removing the assigned webhook.
     * @param avatar URL of the avatar. (Defaults to Discord PFP.)
     */
    async ModifyAvatar(avatar: string) {
        let notification_chn_id = new Storage({server: '0', user: '0'}).select(StorageType.Client).get('notif_chn');
        let user = await this.client.guilds.cache.get(process.env.GUILD as string)?.members.fetch(this.userid);
        let url = avatar || user?.user.displayAvatarURL({dynamic: true})

        // Removes the existing webhook.
        let chn = this.client.guilds.cache.get(process.env.GUILD as string)?.channels.cache.get(notification_chn_id);
        (await (chn as TextChannel).fetchWebhooks()).get(this.data.webhookID)?.delete();

        // Now re-run the webhook creation.
        this.AbstractWebhook(url as string);
    }

    /**
     * Fetches and returns the default and current values of the UserProfile's statistical data.
     * @returns StatModel template.
     */
    GetStatData(): StatModel {
        return {
            time_measurement: {
                break_last: this.data.statistics.time_measurement.break_last || "0",
                break_status: this.data.statistics.time_measurement.break_status || 0,
                study_last: this.data.statistics.time_measurement.study_last || "0",
                study_status: this.data.statistics.time_measurement.study_status || 0
            },
            cumulative_break: this.data.statistics.cumulative_break || 0,
            cumulative_study: this.data.statistics.cumulative_study || 0
        }
    }

    /**
     * Can Increment method will check whether incrementing is possible.
     * @returns Returns a boolean whether the week incrementer can continue or not.
     */
    CanIncrement(): boolean {
        console.log(`${this.storage.get("profile").week.current} < ${this.storage.get("profile").week.end}`)
        return (this.storage.get("profile").week.current || 1) < this.storage.get("profile").week.end
    }

    /**
     * Increments the internal week counter.
     */
    IncrementWeek(): void {
        let curInt = this.storage.get("profile").week.current || 1;
        this.storage.set("profile", curInt + 1, "week.current")
    }

    /**
     * Gets the current internal week counter.
     * @returns Week Number
     */
    GetWeek(): number {
        return this.storage.get("profile").week.current || 1;
    }

    SetWeek(week: number): void {
        this.storage.set("profile", week, "week.current")
    }

    GetMaxWeek(): number {
        return this.storage.get("profile").week.end || 1
    }

    SetWeekMax(max: number): void {
        this.storage.set("profile", max, "week.end")
    }

    GetColor(): string {
        return this.storage.get("profile").notify_color || "#5865F2";
    }

    SetColor(hex: string): void {
        this.storage.set("profile", hex, "notify_color")
    }
}

export interface UserProfileModel {
    webhookID: string, // We can store Webhooks under an ID basis.
    id: string, // ???
    tasks: Array<any>
    week: WeekModel,
    notify_color: string,
    statistics: StatModel
}

export interface WeekModel {
    current: number, // The current week iterator.
    end: number // Measurement used to stop the week iterator.
}

export interface StatModel {
    time_measurement: TimeModel
    cumulative_break: Number // Measured in seconds.
    cumulative_study: Number // Measured in seconds.
}

export interface TimeModel {
    break_last: string // Last break update status. (unix)
    break_status: Status // Typed status mode.

    study_last: string // Last study update status. (unix)
    study_status: Status // Typed status mode.
}

export enum MetricType {
    Break = "break",
    Study = "study"
}

export enum Status {
    MEASURING = 1,
    AVAILABLE = 0,
    RESET = -1
}