import { REST, Routes, ApplicationCommandOptionType } from "discord.js";
import "dotenv/config";

const commands = [
    {
        name: 'link',
        description: 'Link your Minecraft account to your discord',
        options: [
            {
                name: 'username',
                description: 'Your Minecraft username',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'type',
                description: 'Account type',
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: 'Online',
                        value: 'online'
                    },
                    {
                        name: 'Offline',
                        value: 'offline'
                    }
                ],
                required: true
            }
        ]
    }
];

const rest = new REST({ version: 10 }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(" Registering commands...")

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), 
            { body: commands }
        )

        console.log(" Commands registered")
    } catch (err) {
        console.log(` ${err}`)
    }
})();