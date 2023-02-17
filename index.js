require("dotenv").config();
const { channel } = require("diagnostics_channel");
const {Client, GatewayIntentBits, EmbedBuilder,} = require("discord.js");
const googleIt = require('google-it');
const puppeteer = require('puppeteer');


async function scrapeImage(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    
    const [el] = await page.$x('//*[@id="mw-content-text"]/div[1]/table[1]/tbody/tr[2]/td/div/div/div[1]/div[1]/div/a/img');
    const [el2] = await page.$x('//*[@id="mw-content-text"]/div[1]/table[1]/tbody/tr[2]/td/span/a/img');
    const [el3] = await page.$x('//*[@id="mw-content-text"]/div[1]/figure[1]/a/img');

    if(typeof el !== "undefined"){
        const src = await el.getProperty('src');
        return src.jsonValue();
    }
    else if(typeof el2 !== "undefined"){
        const src = await el2.getProperty('src');
        return src.jsonValue();
    }
    else if(typeof el3 !== "undefined"){
        const src = await el3.getProperty('src');
        return src.jsonValue();
    }
    else {
        return 'Image not found';
    }
}

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
        let inputText = msg.content.substring(8).toLowerCase();
        if(!inputText.includes("wiki")){
            inputText += " wiki";
        }
        let searchHit = false;

        googleIt({'query': inputText}).then(async result => {
            for(const item of result){
                if(item.title.search(/Wikipedia|Wikipedie/) != -1){
                    let imageSrc = await scrapeImage(item.link);
                    if(imageSrc != 'Image not found'){
                        exampleEmbed.setImage(imageSrc);
                    }
                    
                    exampleEmbed.addFields({name: item.title, value: item.link + "\n" + item.snippet});
                    searchHit = true;
                }
            }
            if(searchHit){
                msg.channel.send({embeds: [exampleEmbed]});
            }else{
                msg.reply("No Wiki page was found for key: " + inputText);
            }         
        });
    }
});

client.login(process.env.TOKEN);