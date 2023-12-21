import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config"
import uuidOffline from "./uuid.js";
import axios from "axios";
import fs from "fs"

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(` ${client.user.tag} is online`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName == "link") {
        const username = interaction.options.get('username').value;
        const type = interaction.options.get('type').value;
        const updateWhitelist = async (data) => {
            data.id = data.id.substring(0, 8) + '-' +
                      data.id.substring(8, 12) + '-' + 
                      data.id.substring(12, 16) + '-' + 
                      data.id.substring(16, 20) + '-' + 
                      data.id.substring(20);
        
            let whitelist = JSON.parse(fs.readFileSync("whitelist.json"));
            whitelist.push(data);
            fs.writeFileSync("whitelist.json", JSON.stringify(whitelist));
            await interaction.reply({
                content: `Created new whitelist entry for \`${username}\``,
                ephemeral: true,
            });
        }
        var user_info = {
            id: null,
            name: username,
        };
        try {
            if (type === 'offline') {
                user_info.id = uuidOffline(username);
                updateWhitelist(user_info);
            } else if (type === 'online') {
                axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
                .then((response) => {
                    if (response.status === 200) updateWhitelist(response.data);
                    else throw "not_found";
                })
                .catch((err) => {
                    if (err === "not_found") throw "not_found";
                });
            }
        } catch (err) {
            if (err === "not_found")
                await interaction.reply({
                    content: `User \`${username}\` not found`,
                    ephemeral: true,
                });
            console.log(err);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);