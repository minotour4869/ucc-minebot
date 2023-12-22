import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import "dotenv/config"
import uuidOffline from "./uuid.js";
import axios from "axios";
import fs from "fs"
import { MongoClient } from "mongodb";

const whitelist_dir = "whitelist.json";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const mongoUrl = "mongodb://" + process.env.MONGODB_USER + ":" + process.env.MONGODB_PWD + "@localhost:27017"
const mongoDb = new MongoClient(mongoUrl);

client.on('ready', () => {
    console.log(` ${client.user.tag} is online`);
});

client.on('interactionCreate', async interaction => {
    await mongoDb.connect();
    const userTable = mongoDb.db().collection("userTable");
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName == "link") {
        const username = interaction.options.get('username').value;
        const type = interaction.options.get('type').value;
        // console.log(interaction.user.id);
        
        // Check whether the user have linked an account or not
        const data = await userTable.find({ user: interaction.user.id }).toArray();
        console.log(data)
        if (data.length) {
            await interaction.reply({
                content: `You have linked an account for the server, please unlink to link another account`,
                ephemeral: true
            });
            return;
        }
        
        // Check user have in whitelist or not
        const updateWhitelist = async (data) => {
            data.uuid = data.uuid.substring(0, 8) + '-' +
                        data.uuid.substring(8, 12) + '-' + 
                        data.uuid.substring(12, 16) + '-' + 
                        data.uuid.substring(16, 20) + '-' + 
                        data.uuid.substring(20);
        
            let whitelist = JSON.parse(fs.readFileSync(whitelist_dir));
            for (const id in whitelist) {
                // console.log(whitelist[id]);
                if (JSON.stringify(whitelist[id]) == JSON.stringify(data)) {
                    await interaction.reply({
                        content: `Entry for user \`${username}\` existed`,
                        ephemeral: true
                    });
                    return;
                }
            }
            whitelist.push(data);
            fs.writeFileSync(whitelist_dir, JSON.stringify(whitelist, null, 4));
            await interaction.reply({
                content: `Created new whitelist entry for \`${username}\``,
                ephemeral: true,
            });
        }

        var user_info = {
            uuid: null,
            name: username,
        };

        try {
            if (type === 'offline') {
                user_info.uuid = uuidOffline(username);
                updateWhitelist(user_info);
                await userTable.insertOne({
                    user: interaction.user.id,
                    uuid: user_info,
                    mode: "offline"
                })
            } else if (type === 'online') {
                axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
                .then((response) => {
                    if (response.status === 200) {
                        user_info.uuid = response.data.id
                        updateWhitelist(user_info);
                        userTable.insertOne({
                            user: interaction.user.id,
                            uuid: user_info,
                            mode: "online"
                        }).then()
                    }
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

    if (interaction.commandName == "unlink") {
        const data = await userTable.find({ user: interaction.user.id }).toArray();
        console.log(data);
        if (!data.length) {
            await interaction.reply({
                content: "You haven't linked any account yet",
                ephemeral: true,
            });
            return;
        }
        let username = data[0].uuid.name;

        let whitelist = JSON.parse(fs.readFileSync(whitelist_dir));
        for (const id in whitelist) {
            if (JSON.stringify(whitelist[id]) == JSON.stringify(data[0].uuid)) {
                whitelist.splice(id);
                break;
            }
        }
        fs.writeFileSync(whitelist_dir, JSON.stringify(whitelist, null, 4));
        await userTable.deleteOne(data[0]);
        await interaction.reply({
            content: `Unlinked account \`${username}\``,
            ephemeral: true,
        });
    }

    if (interaction.commandName == "info") {
        const data = await userTable.find({ user: interaction.user.id }).toArray();
        console.log(data);
        if (!data.length) {
            await interaction.reply({
                content: "You haven't linked any account yet",
                ephemeral: true,
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setAuthor(
                { name: interaction.user.displayName, iconURL: interaction.user.avatarURL() }
            )
            .addFields(
                { name: 'Username', value: data[0].uuid.name, inline: true }
            );

        if (data[0].mode == "online") embed.setImage(`https://mc-heads.net/avatar/${data[0].uuid.id}/100`);
        
        await interaction.reply({
            embeds: [embed]
        })
    }
});

client.login(process.env.DISCORD_TOKEN);