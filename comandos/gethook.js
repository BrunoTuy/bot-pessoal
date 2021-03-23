module.exports = {
  exec: async ({ bot, callback, original }) => {
  	const resp = await bot.getWebHookInfo();

  	console.log('- Resposta getWebHookInfo', resp);

    callback([
      JSON.stringify(resp)
    ]);
  }
};
