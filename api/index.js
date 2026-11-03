const BootstrapFactory = require('../src/index');

let cachedHandler = null;

module.exports = async (req, res) => {
  if (!cachedHandler) {
    const { expressApp } = await BootstrapFactory.createApplication();
    cachedHandler = expressApp;
  }
  return cachedHandler(req, res);
};
