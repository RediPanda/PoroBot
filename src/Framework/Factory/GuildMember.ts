import type { Client } from 'discord.js';
import { Logger, LoggerType } from '../IO/Logger';

const CONSTANTS = {
    STAFF: "593913045441576970",
    STUDIO: "397706419522240512"
}

export class MemberManager {
    client: Client;
    serverid: string;
    userid: string;

    constructor(client: Client, serverid: string, userid: string) {
        this.client = client;
        this.serverid = serverid;
        this.userid = userid;

        if (process.env.NODE_ENV === 'development') new Logger("GuildMemberManager", true).log(LoggerType.DEBUG, `Instating the GuildManager class structure for ${serverid}.`)
    }


    async addRole(role: string): Promise<void> {
        const guild = await this.client.guilds.fetch(this.serverid);
        const member = await guild.members.fetch(this.userid);

        try {
            await member.roles.add(role);
        } catch(err: unknown) {
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `There was an issue assigning roles for Server - ${this.serverid}.`);
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `${err}`);
        }
    }


    async addRoles(roles: string[]): Promise<void> {
        const guild = await this.client.guilds.fetch(this.serverid);
        const member = await guild.members.fetch(this.userid);

        try {
            await member.roles.add(roles);
        } catch(err: unknown) {
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `There was an issue assigning roles for Server - ${this.serverid}.`);
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `${err}`);
        }
    }

    async removeRole(role: string): Promise<void> {
        const guild = await this.client.guilds.fetch(this.serverid);
        const member = await guild.members.fetch(this.userid);

        try {
            await member.roles.remove(role);
        } catch(err: unknown) {
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `There was an issue removing roles for Server - ${this.serverid}.`);
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `${err}`);
        }
    }

    async removeRoles(roles: string[]): Promise<void> {
        const guild = await this.client.guilds.fetch(this.serverid);
        const member = await guild.members.fetch(this.userid);

        try {
            await member.roles.remove(roles);
        } catch(err: unknown) {
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `There was an issue removing roles for Server - ${this.serverid}.`);
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `${err}`);
        }
    }

    async hasRole(role: string): Promise<boolean> {
        const guild = await this.client.guilds.fetch(this.serverid);
        const member = await guild.members.fetch(this.userid);

        try {
            return await member.roles.cache.has(role);
        } catch(err: unknown) {
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `There was an issue finding roles for Server - ${this.serverid}.`);
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `${err}`);
        }
        return false;
    }

    async changeNickname(newnick: string): Promise<void> {
        const guild = await this.client.guilds.fetch(this.serverid);
        const member = await guild.members.fetch(this.userid);

        try {
            member.setNickname(newnick);
        } catch (err: unknown) {
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `There was an issue setting a nickname for Server - ${this.serverid}.`);
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `${err}`);
        }
    }

    async ban(reason: string): Promise<void> {
        const guild = await this.client.guilds.fetch(this.serverid);
        const member = await guild.members.fetch(this.userid);

        try {
            await member.ban({reason: reason});
        } catch(err: unknown) {
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `There was an issue banning a user from Server - ${this.serverid}.`);
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `${err}`);
        }
    }

    async kick(reason: string): Promise<void> {
        const guild = await this.client.guilds.fetch(this.serverid);
        const member = await guild.members.fetch(this.userid);

        try {
            await member.kick(reason);
        } catch(err: unknown) {
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `There was an issue kick a user from Server - ${this.serverid}.`);
            new Logger("GuildMemberManager", true).log(LoggerType.ERROR, `${err}`);
        }
    }

    async isMod(): Promise<boolean> {
        const guild = await this.client.guilds.fetch(CONSTANTS.STAFF);
        const member = await guild.members.fetch(this.userid);

        if (!member) return false; // Member is not present in the Staff server.

        const team = ['Owner', 'Override Administrator', 'Head Management', 'Admin', 'Moderator'];

        if (team.includes(member.roles.highest.name)) return true;
        return false;
    }
}