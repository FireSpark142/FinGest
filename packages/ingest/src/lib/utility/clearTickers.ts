import Redis from 'ioredis';

const globalAny: any = global;
const log = (globalAny.log = (...l: any) => console.log(...l));
const redis = new Redis();

redis.on('error', (err) => console.log('Redis Client Error', err));

export const clearStreams = async function () {
  var keyList = await redis.keys('*trade');
  log(keyList);

  for (let k = 0; k < keyList.length; k++) {
    await redis.del(keyList[k]);
    log(keyList[k], ' deleted');
  }
  redis.disconnect();
};
