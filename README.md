# Welcome to the PoroBot!

Note: This is a framework fork off the Nekonii Abstract v2 repo.

This bot is designed to handle weekly notifications, to-do list and statistics reporting. The framework and other attachments to the bot is coded in Typescript to allow better IntelliSense and Documentation when opened to other developers to further maintain the bot.


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

## Pathing with Interactions.
*This usually applies for Select Menus and Buttons.\
When working with the Discord API, interactions are given IDs to be utilised with the identification and source of interaction. We utilise IDs to deliver to the source, the type of action and the context of the action. The usual naming conventions of IDs are listed as:\
**SOURCETYPE.SOURCE.SOURCEAUTHOR.ACTION.CONTEXT**.\
SourceType - What type of interaction does it come from.\
Source - Where does this interaction come from and where it should be handled to.\
SourceAuthor - The author of the original interaction.
Action - What to do with this interaction, what is it doing?\
Context - Usually the values are followed up upon.\

