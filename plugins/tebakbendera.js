const { Markup } = require('telegraf');
const axios = require('axios');

module.exports = (bot) => {
    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", 
        "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", 
        "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", 
        "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", 
        "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
        "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", 
        "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", 
        "Cyprus", "Czech Republic"
    ];

    const getRandomCountry = () => countries[Math.floor(Math.random() * countries.length)];

    bot.command('tebakbendera', async (ctx) => {
        const correctCountry = getRandomCountry();

        try {
            const res = await axios.get(`https://restcountries.com/v3.1/name/${correctCountry}`);
            const flagUrl = res.data[0].flags.svg;

            const shuffledCountries = [...countries].sort(() => 0.5 - Math.random()).slice(0, 44);
            if (!shuffledCountries.includes(correctCountry)) {
                shuffledCountries[Math.floor(Math.random() * 44)] = correctCountry;
            }

            const options = shuffledCountries.map(country => Markup.button.callback(country, country));

            await ctx.replyWithPhoto(flagUrl, {
                caption: 'Tebak bendera ini!',
                reply_markup: Markup.inlineKeyboard(options, { columns: 4 })
            });

            bot.action(shuffledCountries, (answerCtx) => {
                if (answerCtx.match[0] === correctCountry) {
                    answerCtx.reply('🎉 Benar! Itu adalah bendera ' + correctCountry + '!');
                } else {
                    answerCtx.reply('❌ Salah. Coba lagi!');
                }
                return answerCtx.answerCbQuery();
            });
        } catch (error) {
            console.error(error);
            ctx.reply('Terjadi kesalahan saat mengambil data bendera. Silakan coba lagi.');
        }
    });
};
