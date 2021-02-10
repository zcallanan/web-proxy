const query = require('./index.js');
const format = require('pg-format');
const { promisify } = require("util");
const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Redis

const redis = require("redis");
const client = redis.createClient();

client.on("error", (error) => {
  console.error(error);
});

const getAsync = promisify(client.get).bind(client);

// Response

const getResult = async (req) => {
  try {
    return await getAsync(req.header('X-PRODUCT'));

  } catch (err) {
    console.log(err)
  }
}

const getProductItems = async (req, res) => {
  let result;
  // Get product's stored hash if available

  result = JSON.parse(await getResult(req));

  if (!result ) {
    // If no stored hash, get it from the DB
    let queryString = format('SELECT * FROM %I', req.header('X-PRODUCT'));
    result = await query(queryString);

    // Save object to redis as a hash
    client.set(req.header('X-PRODUCT'), JSON.stringify(result), 'EX', process.env.CACHE_TIMER)
  };

  res.json(result);
}

module.exports = getProductItems;
