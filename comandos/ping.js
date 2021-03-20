module.exports = {
  exec: ({ callback, original }) => {
    callback([
      ' ~~ Pong ~~ ',
      original.chat.id
    ]);
  }
};
