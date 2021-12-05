const numeroPositivo = valor => parseInt(valor) < 0 ? parseInt(valor) * -1 : parseInt(valor);

module.exports = numeroPositivo;
