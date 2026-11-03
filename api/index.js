import BootstrapFactory from '../src/index.js';

let cachedHandler = null;

export default async (req, res) => {
  if (!cachedHandler) {
    const { expressApp } = await BootstrapFactory.createApplication();
    cachedHandler = expressApp;
  }
  return cachedHandler(req, res);
};
