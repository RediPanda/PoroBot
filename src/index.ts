// Adds the ability to read from env files.
import {config} from 'dotenv'
config();

// Dependency modules.
import * as Sentry from '@sentry/node';

// Sentry configuration. [Error reporting stack.]
Sentry.init({
  dsn: "https://de6e49473ba148d7852a61c54fef4d48@o380096.ingest.sentry.io/5974819",

  tracesSampleRate: ((process.env.NODE_ENV === "production") ? 0.75 : 1)
})

// Framework for the Bot.
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { ApplicationHandler } from './Framework/WS/LoadApplications';
import { Logger, LoggerType } from './Framework/IO/Logger';
import type { Emoji, EmojiResolvable, User, UserResolvable } from 'discord.js';
import { EventEmitter } from 'stream';
import { createPool, Pool } from 'mysql2/promise';
import discordmodals from 'discord-modals'
import {Utility} from './Framework/Factory/Utility'

// TS Declarations
declare module 'discord-akairo' {
  interface AkairoClient {
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
    inhibitorHandler: InhibitorHandler;
    events: EventEmitter,
    getEmoji(snowflake: EmojiResolvable): Emoji;
    getUser(snowflake: UserResolvable): Promise<User>;
    slashCommands: Record<string, unknown>[]
    botDir: string
    pool: Pool
    utils: Utility;
    // utils: Record<string, unknown>;
  }
}

// Development tools.
// Logs flusher.
if (process.env.NODE_ENV === 'development' && process.env.STATE === 'FLUSH') {
  const buffer = new Logger('framework');
  buffer.log(LoggerType.WARN, 'Flushing all persistent log files.');
  buffer.flushLogs();
  process.exit(0);
}

// Webhook and Scope-oriented Managers.
// import { WebhookManager, ServerManager, MemberManager } from './src/core/Managers'
const frameworkLogger = new Logger("Framework", true);
frameworkLogger.log(LoggerType.INFO, "--------> Start of new bot session.\n")
export class Core extends AkairoClient {
  constructor() {
    super({
      intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_BANS',
        'GUILD_EMOJIS_AND_STICKERS',
        'GUILD_INTEGRATIONS',
        'GUILD_WEBHOOKS',
        'GUILD_INVITES',
        'GUILD_VOICE_STATES',
        'GUILD_PRESENCES',
        'GUILD_MESSAGES',
        'GUILD_MESSAGE_REACTIONS',
        'GUILD_MESSAGE_TYPING',
        'DIRECT_MESSAGES',
        'DIRECT_MESSAGE_REACTIONS',
        'DIRECT_MESSAGE_TYPING'
      ],
      ownerID: ["222954293374746626"],
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    });

    let botPath = './src';
    if (process.env.NODE_ENV === 'production') botPath = './dist'

    this.botDir = botPath;

    // Command Handler
    this.commandHandler = new CommandHandler(this, {
      commandUtil: true,
      directory: `${botPath}/Commands/`,
      handleEdits: true,
      prefix: "?",
    });

    // Inhibitor
    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: `${botPath}/Inhibitors/`,
    });

    // Listeners
    this.listenerHandler = new ListenerHandler(this, {
      directory: `${botPath}/Listeners/`,
    });

    // Custom Events Listeners
    this.events = new EventEmitter();

    // Load Custom Database pool.
    this.pool = createPool({
      host: process.env.database_host,
      user: process.env.database_user,
      password: process.env.database_password,
      database: process.env.database_name,
      waitForConnections: true,
      connectionLimit: 30,
    });

    // Load all respective handlers.
    this.commandHandler.loadAll();
    frameworkLogger.log(LoggerType.INFO, "Loading the command handler!")

    // -- Inhibitors
    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.inhibitorHandler.loadAll();
    frameworkLogger.log(LoggerType.INFO, "Loading the inhibitor handler!")

    // -- Listeners
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      events: this.events,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler,
    });

    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.loadAll();
    frameworkLogger.log(LoggerType.INFO, "Loading the listener handler!")
  }

  // Global Functions.
  override getEmoji(snowflake: string): Emoji {
    return this.util.resolveEmoji(snowflake, this.emojis.cache)
  }

  override async getUser(snowflake: string): Promise<User> {
    return this.util.resolveUser(snowflake, this.users.cache) || await this.users.fetch(snowflake);
  }
}

const client = new Core();

// Attempt a socket to the Discord API.
frameworkLogger.log(LoggerType.INFO, "Attempting to connect to the Discord API...")
client
  .login(process.env.AUTHORISATION)
  .then(() => {
    frameworkLogger.log(LoggerType.INFO, `Session successfully connected! Running under as: [PID: ${process.pid}] ${client?.user?.tag}`)

    // Read and bind interactions.
    new ApplicationHandler(client).readInteractions();
    discordmodals(client); // Binds the modal handler.

    // Bind the utility system to the client.
    client.utils = new Utility(client);
  })
  .catch((err) => {
    frameworkLogger.log(LoggerType.ERROR, "There was an issue establishing a connection to the Discord API Gateway!")
    frameworkLogger.log(LoggerType.ERROR, err)
  });