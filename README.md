# Welcome to the Luplo Manager Bot!

Note: This is a fork off the YulxVol Manager v2 repo.

This bot is designed to handle both Moderation and other fun interactions for the Luplo Community. The framework and other attachments to the bot is coded in Typescript to allow better IntelliSense and Documentation when opened to other developers to further maintain the bot.


# Documentation

The following are the pre-requisite modules the bot relies on. You can read their documentations here:

 - [Local Bot Documentation]: Refer to **[Compiling and Developing]**
 - [Discord.JS v13] https://discord.js.org/#/docs/main/13.1.0/general/welcome
 - [Discord Akairo] https://discord-akairo.github.io/#/docs/main/master/class/AkairoClient

## Compiling and Developing

The following Yarn commands are available here with in-depth descriptions as to what tasks they perform.
You can download Yarn here: https://classic.yarnpkg.com/en/

***Yarn Command List:***

 - **yarn run build** - Builds and compiles the Typescript files in [/src] to [/packages].
 - **yarn run dev** - Runs the bot in developer mode. This sets the environment variables to developer mode and compiles on the run whilst coding.
 - **yarn run docs** - Builds the documentation files for the Bot. Takes in the references from [/src/docs.ts].
 - **yarn run flush** - Flushes all log files from [/Resources/Logging/*].
 - **yarn run lint** - Runs the Linter following the ESLint rules. Useful before making a PR as we do have a workflow that checks the consistency of the project's code space.
 - **yarn run slash** - Tasked to upload newly built slash commands to the Discord API directly.

### Node Environment Variables
Please make sure to add the .env file to the root folder (where /src lies, not inside the src folder) as to allow the bot to take in the secret parameters during operations.

## Adopting new files to the Documentation pages.

If you are adding new TS files that handles directly to the bot's core functionality and you want the files to be available in the documentation compiler, export it by adding the export statement in [/src/docs.ts].
You can view the compile documentation by opening the .html file in [/docs/index.html].

## Enumeration states to consider.
When working with the Remote Database and obtaining verification details, the following is defined as:
 - **verify_id** - The Discord Snowflake ID. 0 usually means the field is by default/empty (not verified).
 - **verify_code** - The signature code. Combines both state and verification code.\
    IF the code is 0, this means that the person has not started the verification stage.\
    IF the code is 1, this means that the person has been verified. (Validate with verify_id).\
    IF the code starts with a stringed prefix: (C_), this means that the person has started the verification stage, but hasn't been finalised. (Pending Discord Response).\
    If the case scenario that the person lost the original verify_code issued by the game, then they are free to generate another code and rebind it to the bot at a later time.\

## Pathing with Interactions.
*This usually applies for Select Menus and Buttons.\
When working with the Discord API, interactions are given IDs to be utilised with the identification and source of interaction. We utilise IDs to deliver to the source, the type of action and the context of the action. The usual naming conventions of IDs are listed as:\
**SOURCETYPE.SOURCE.SOURCEAUTHOR.ACTION.CONTEXT**.\
SourceType - What type of interaction does it come from.\
Source - Where does this interaction come from and where it should be handled to.\
SourceAuthor - The author of the original interaction.
Action - What to do with this interaction, what is it doing?\
Context - Usually the values are followed up upon.\

