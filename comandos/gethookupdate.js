module.exports = {
  exec: async ({ bot, callback, original }) => {
    const resp = await bot.getUpdates();

    console.log('- Resposta getUpdates', resp);

    callback([
      JSON.stringify(resp)
    ]);
  }
};
