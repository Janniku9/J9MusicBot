bot.onText(/\/favourites/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

bot.onText(/\/top/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});

bot.onText(/\/feedback/, (msg) => {
    bot.sendMessage(msg.chat.id, "TODO", {parse_mode: 'HTML'});
});