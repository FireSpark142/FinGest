import Redis from 'ioredis';
import JSON from 'JSON';

const globalAny: any = global;
const log = (globalAny.log = (...l: any) => console.log(...l));
const redis = new Redis();

redis.on('error', (err) => console.log('Redis Client Error', err));

const exchangeMarketMap = new Map();

const buildMap = async function (exchangeName) {
  const exchangeKey = exchangeName + 'Markets';
  log('In buildMap ->', exchangeKey);
  const exchangeMarkets = await redis.get(exchangeKey);

  if (exchangeMarkets == null) {
    log(`${exchangeKey} doesn't exist`);
    return;
  }
  // data[idToUse, symbolToUse, baseToUse, quoteToUse]
  const eMarketsObj = JSON.parse(exchangeMarkets);
  log(eMarketsObj);

  var mapObj;
  const marketsMap = new Map();
  for (let k = 0; k < eMarketsObj.ids.length; k++) {
    // marketData.push([idToUse, symbolToUse, baseToUse, quoteToUse]);
    mapObj = eMarketsObj.data[k];
    marketsMap.set(mapObj[0], mapObj);
    marketsMap.set(mapObj[1], mapObj);
  }
  exchangeMarketMap.set(exchangeName, marketsMap);
};

export const trackStreams = async function () {
  var keyList = await redis.keys('*trade');
  // log(keyList);

  var totalMemUsed = 0;
  var memUse = 0;
  var totalTicks = 0;
  var ticks = 0;
  for (let k = 0; k < keyList.length; k++) {
    memUse = await redis.memory('USAGE', keyList[k]);
    ticks = await redis.xlen(keyList[k]);
    log(k, ':> ', keyList[k], ':', ticks, ' >> ', memUse, 'bytes');
    totalMemUsed += memUse;
    totalTicks += ticks;
  }
  log(
    totalTicks,
    'ticks in',
    totalMemUsed / (1024 * 1024),
    'MB, ',
    totalMemUsed / totalTicks,
    'byte/tick'
  );
  redis.disconnect();
};
