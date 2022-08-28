import Redis from "ioredis";
import JSON from "JSON";
import ccxt from "ccxt";
// import util from "util";

global.log = (...l) => console.log(...l);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const exchangeFilters = ["binance", "kucoin"];
//const exchangeFilters = ["kucoin"];

const getMarkets = async (exchangeObj) => {
  let markets = await exchangeObj.load_markets();
  console.log(exchangeObj.id, markets);
  //console.log(util.inspect(markets, false, null, true));
};

// create a connection to redis
var redis = new Redis();
redis.on("error", (err) => console.log("Redis Client Error", err));

(async function main() {
  console.log(ccxt.exchanges); // print all available exchanges

  var selectedExchanges = [];

  ccxt.exchanges.forEach((exchange) => {
    exchangeFilters.forEach((filter) => {
      console.log(exchange);
      if (exchange.includes(filter)) {
        selectedExchanges.push(exchange);
      }
    });
  });

  await sleep(10000);
  // console.log("Selected:", selectedExchanges);

  redis.set("exchanges", JSON.stringify({names: selectedExchanges}));

  var marketCt = 0;

  for (let k = 0; k < selectedExchanges.length; ++k) {
    var exchangeKey = selectedExchanges[k] + "Markets";
    log(exchangeKey);

    // Create the ccxt exchange object
    var exchangeClass = ccxt[selectedExchanges[k]];
    console.log(exchangeClass);
    var exchange = new exchangeClass();

    await getMarkets(exchange);
    console.log(exchange.markets);
    //console.log(util.inspect(exchange.markets, false, null, true));

    var symbolKeys = Object.keys(exchange.markets);
    //console.log(util.inspect(symbolKeys, false, null, false));

    log(exchange.markets[symbolKeys[0]]);
    log(exchange.markets[symbolKeys[0]].symbol);
    log(exchange.markets[symbolKeys[0]].lowercaseId);
    log(exchange.markets[symbolKeys[0].id]);
    log(exchange.markets[symbolKeys[0]].info.status);
    //continue;

    var marketIds = [];
    var marketSymbols = [];
    var marketBases = [];
    var marketQuotes = [];
    var marketData = [];

    var statusToUse;
    var symbolToUse;
    var idToUse;
    var baseToUse;
    var quoteToUse;

    symbolKeys.forEach((item) => {

      statusToUse = exchange.markets[item].info.status !== "BREAK";
      // NEED logic to decide which symbols to include.
      symbolToUse = exchange.markets[item].symbol;
      idToUse = exchange.markets[item].id;
      baseToUse = exchange.markets[item].base;
      quoteToUse = exchange.markets[item].quote;
      if (
          statusToUse === true &&
          symbolToUse !== undefined &&
          idToUse !== undefined
      ) {
        marketCt += 1;
        console.log(marketCt, ": ", symbolToUse, idToUse);
        marketIds.push(idToUse);
        marketSymbols.push(symbolToUse);
        marketBases.push(baseToUse);
        marketQuotes.push(quoteToUse);
        marketData.push([idToUse, symbolToUse, baseToUse, quoteToUse]);
      }
    });

    log(marketData);
    // set the market key/value in redis
    let marketString
    marketString = JSON.stringify({
      ids: marketIds,
      symbols: marketSymbols,
      bases: marketBases,
      quotes: marketQuotes,
      data: marketData,
    });
    redis.set(exchangeKey, marketString);
    //const value = redis.get(exchangeKey);
    for (let k = 0; k < marketData.length; ++k) {
      log(`${exchangeKey} => ${marketData[k]}`);
    }
  }

  redis.disconnect();
})();
