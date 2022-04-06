import dayjs from 'dayjs';
import { appendFileSync, mkdir, unlink, readdirSync, statSync } from 'fs';
import path from 'path'

/**
 * The Logger class responsible for handing CLI feedback and IO streams for logging persistency. [In colour!]
 * @export
 * @class Logger
 */
export class Logger {
    dist: string;
    persistence: boolean;
    override: string;
    /**
     * @param {string} Logger Display name for the Logger. Helpful to split it via department.
     * @param {boolean} Persistent To classify if the Logger Class should persist log files or not.
     * @param {string} Override The overriding filename for the Logging class.
     */
    constructor(name: string, persistent = false, override = `${process.env.NODE_ENV}-${dayjs().format('DD-MM-YYYY')}`) {
        this.dist = name;
        this.persistence = persistent;
        this.override = override;
    }

    /**
     * Appends a string to a pre-set logging destination.
     * @param {string} Content The content you plan to append.
     */
    async appendToFile(content: string): Promise<void> {
        const fileName = this.override;
        mkdir(path.join(process.cwd(), 'Resources', 'Logging'), {recursive: true}, (err) => {
            if (err) console.error(`[Error] There was an issue during IO operations.\n${err}`);

            appendFileSync(path.join(process.cwd(), 'Resources', 'Logging', `${fileName}.txt`), content);
        })
    }

    async flushLogs(): Promise<void> {
        if (process.env.NODE_ENV === 'development' && process.env.STATE === 'FLUSH') {
            const files = readdirSync(path.join(process.cwd(), 'Resources', 'Logging'))

            this.log(LoggerType.WARN, '/Resources/Logging')
            
            // Iterate per file.
            for (const file of files) {
                this.log(LoggerType.WARN, `  ╰ 📄 ${file} [${statSync(path.join(process.cwd(), 'Resources', 'Logging', file)).size / 1000} kb]`)
                unlink(path.join(process.cwd(), 'Resources', 'Logging', file), (err) => {
                    if (err) throw err;
                })
            }
        }
    }

    logTypeColor(logType: LoggerType): LC {
        return LoggerColor[logType];
    }

    /**
     * Main logging function for the Logger class.
     * @param {LoggerType} Type Type of logging.
     * @param {string} Content The content to log.
     * @method
     */
    log(level: LoggerType, content: string): void {
        const Timestamp = dayjs().format('(DD-MMM) HH:mm:ss');
        const streamdata = `${LC.FgGreen}${Timestamp}${LC.Reset} ${LC.FgRed}[${this.dist}] ${this.logTypeColor(level)}[${level}]:${LC.Reset} ${content}${LC.Reset}`;

        if (level === LoggerType.DEBUG && process.env.NODE_ENV !== "development") return;

        if (this.persistence) {
            const cleanedContent = `${Timestamp} [${this.dist}] [${level}]: ${content}\n`;
            this.appendToFile(cleanedContent)
        }
        console.log(streamdata);
    }
}

/**
 * Logger Display Types
 */
export enum LoggerType {
    INFO = "Info",
    WARN = "Warn",
    DEBUG = "Debug",
    VERBOSE = "Verbose",
    DATA = "Data",
    ERROR = "Error"
}

/**
 * Logger Colour Formats
 */
export enum LC {
    // Reference: https://stackoverflow.com/a/41407246
    // Formatting.
    Reset = "\x1b[0m",
    Bright = "\x1b[1m",
    Dim = "\x1b[2m",
    Underscore = "\x1b[4m",
    Blink = "\x1b[5m",
    Reverse = "\x1b[7m",
    Hidden = "\x1b[8m",
    // Font Customisation.
    FgBlack = "\x1b[30m",
    FgRed = "\x1b[31m",
    FgGreen = "\x1b[32m",
    FgYellow = "\x1b[33m",
    FgBlue = "\x1b[34m",
    FgMagenta = "\x1b[35m",
    FgCyan = "\x1b[36m",
    FgWhite = "\x1b[37m",
    // Background Customisation.
    BgBlack = "\x1b[40m",
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgWhite = "\x1b[47m"
}

/**
 * Logger Colour Type Constants
 * @property
 */
const LoggerColor = {
    "Data": LC.FgMagenta,
    "Debug": LC.FgGreen,
    "Error": LC.FgRed,
    "Info":LC.FgBlue,
    "Verbose": LC.FgCyan,
    "Warn": LC.FgYellow
}