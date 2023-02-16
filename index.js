require("dotenv").config();
const { channel } = require("diagnostics_channel");
const {Client, GatewayIntentBits, EmbedBuilder,} = require("discord.js");
const googleIt = require('google-it');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once("ready", () => {
    console.log("Bot ready...");
});

client.on("messageCreate", async(msg) => {
    if(msg.content.search(/\?search/) == 0){
        const exampleEmbed = new EmbedBuilder().setTitle('Search results');
        let inputText = msg.content.substring(8)
        let searchHit = false;

        await googleIt({'query': inputText}).then(result => {
            result.forEach(item => {
                if(item.title.search(/Wikipedia|Wikipedie/) != -1){
                    //exampleEmbed.setImage()
                    exampleEmbed.addFields({name: item.title, value: item.link + "\n" + item.snippet});
                    searchHit = true;
                }
            });         
        });
        if(searchHit){
           msg.channel.send({embeds: [exampleEmbed]});
        }else{
            msg.reply("No Wiki page was found for key: " + inputText);
        }
    }
});

client.login(process.env.TOKEN);