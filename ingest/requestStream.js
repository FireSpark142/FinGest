import Redis from "ioredis";
import ccxt from "ccxt";
import util from "util";

global.log = (...l) => console.log(...l);

const buildMap = (keys, values) => {
  const map = new Map();
  for (let i = 0; i < keys.length; i++) {
    map.set(keys[i], values[i]);
  }
  return map;
};

const redis = new Redis();

redis.on("error", (err) => console.log("Redis Client Error", err));

async function main() {
  var exchanges = JSON.parse(await redis.get("exchanges"));

  if (exchanges == null) return;

  log(exchanges);
  exchanges.names.forEach((item) => {
    log(item);
  });

  let k;
  for (k = 0; k < exchanges.names.length; k++) {
    var markets = JSON.parse(await redis.get(exchanges.names[k] + "Markets"));
    if (markets == null) return;
    log(markets);
    var mapIdToSymbol = buildMap(markets.ids, markets.symbols);
    var mapSymbolToId = buildMap(markets.symbols, markets.ids);
    log("mapIdToSymbol", mapIdToSymbol);
    log("mapSymbolToId", mapSymbolToId);

    // Create the ccxt exchange object
    var exchangeClass = ccxt[exchanges.names[k]];
    console.log(exchangeClass);
    var exchange = new exchangeClass();

    // do something with the exchange
    log(markets.symbols[1]);
    var kLine1 = await exchange.fetchOHLCV(markets.symbols[1], "1m");
    log(kLine1);
    log(util.inspect(kLine1, false, null, true));

    const key = "dataRequest";
    var symbolForTick;
    var requestObj;
    for (let k = 0; k < 30; k++) {
      symbolForTick =
          markets.symbols[Math.floor(Math.random() * markets.symbols.length)];
      symbolForTick = exchange.id + ":" + symbolForTick;
      // log(symbolForTick);
      requestObj = {};
      requestObj.exchange = exchange.id;
      requestObj.symbol = symbolForTick;
      requestObj.type = "trade";
      // log(requestObj);
      try {
        const result = await redis.rpush(key, JSON.stringify(requestObj));
        console.log(result)

      } catch (err) {
        log(err);
      }
    }
  }
  redis.disconnect();
}

main();
