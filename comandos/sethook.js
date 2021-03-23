module.exports = {
  exec: async ({ bot, callback, original }) => {
    const resp = await bot.setWebHook(`https://bot-person.herokuapp.com/bot${process.env.TOKEN_TELEGRAM}`);

    console.log('- Resposta setWebHookInfo', resp);

    callback([
      process.env.TOKEN_TELEGRAM,
      JSON.stringify(resp)
    ]);
  }
};
