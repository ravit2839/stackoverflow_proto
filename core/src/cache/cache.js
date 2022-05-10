const Redis = require('redis');

const client = Redis.createClient({
  password: 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81',
  url: process.env.REDIS_URI,
});

const DEFAULT_EXPIRATION_TIME = 120;
client.connect();
async function getOrSetCache(key, callBack) {
  console.log('Redis client connected');
  const data = await client.get(key);
  if (data != null) {
    console.log('cache hit');
    return JSON.parse(data);
  }
  console.log('cache miss');
  const newData = await callBack();
  console.log(`Caching: ${newData}`);
  await client.setEx(key, DEFAULT_EXPIRATION_TIME, JSON.stringify(newData));
  return newData;
}

module.exports = { getOrSetCache }
