import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config"
import uuidOffline from "./uuid.js";
import axios from "axios";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(` ${client.user.tag} is online`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName == "link") {
        const username = interaction.options.get('username').value;
        const type = interaction.options.get('type').value;
        var user_info = {
            name: username,
            id: ''
        };
        try {
            if (type === 'offline') {
                user_info.id = uuidOffline(username);
            } else if (type === 'online') {
                axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
                .then((response) => {
                    if (response.status === 200) {
                        console.log(response.data.id);
                        user_info.id = response.data.id;
                    }
                });
            }
        } catch (err) {
            console.log(err)
        } finally {
            if (user_info.id != '')
                await interaction.reply({
                    content: `Created new entry for \`${username}\`\n\`${JSON.stringify(user_info)}\``,
                    ephemeral: true,
                });
            else
                await interaction.reply({
                    content: `User \`${username}\` not found`,
                    ephemeral: true,
                });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);