const fetchProducts = require("../fetch/fetch-products.js");
const subscriberInit = require("../shared/subscriber-init.js");
const { PRODUCT_LIST, TIMEOUT } = require("../shared/constants.js");

subscriberInit();

PRODUCT_LIST.forEach((product, index) =>
  setTimeout(fetchProducts, 5000 * index, product)
);

// Kill script if it hasn't killed itself
setTimeout(() => {
  console.log("timeout");
  return process.exit(22);
}, TIMEOUT);
