import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config"
import uuidOffline from "./uuid.js";
import { XMLHttpRequest } from "xmlhttprequest";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(` ${client.user.tag} is online`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName == "link") {
        const username = interaction.options.get('username').value;
        const type = interaction.options.get('type').value;
        try {
            let user_info = {
                name: username
            };
            if (type == 'offline') {
                user_info.id = uuidOffline(username);
            } else if (type == 'online') {
                const req = new XMLHttpRequest();
                req.addEventListener("loadend", () => {
                    user_info = this.responseText;
                })
                req.open("GET", `https://api.mojang.com/users/profiles/minecraft/${username}`);
                req.send();
            }
            await interaction.reply({
                content: `Created new entry for ${username}\n${JSON.stringify(user_info)}`,
                ephemeral: true,
            });
        } catch (err) {
            console.log(err);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);