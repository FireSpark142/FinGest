import Redis from "ioredis";
import ccxt from "ccxt";
import sjs, { attr } from "slow-json-stringify";

// schema definition
const names = sjs.sjs({
  names: sjs.attr("array")
});

const market = sjs.sjs({
  ids: attr("array"),
  symbols: attr("array"),
  bases: attr("array"),
  quotes: attr("array"),
  data: attr("array")
});


global.log = (...l) => console.log(...l);

const exchangeFilters = ["binance", "kucoin"];

const getMarkets = async (exchangeObj) => {
  await exchangeObj.load_markets();
};

// create a connection to redis
var redis = new Redis();
redis.on("error", (err) => console.log("Redis Client Error", err));

(async function main() {
  var selectedExchanges = [];

  ccxt.exchanges.forEach((exchange) => {
    exchangeFilters.forEach((filter) => {
      if (exchange.includes(filter)) {
        selectedExchanges.push(exchange);
      }
    });
  });


  redis.set("exchanges", names({ names: selectedExchanges }));

  var marketCt = 0;

  for (let k = 0; k < selectedExchanges.length; ++k) {
    var exchangeKey = selectedExchanges[k] + "Markets";

    var exchangeClass = ccxt[selectedExchanges[k]];
    var exchange = new exchangeClass();

    await getMarkets(exchange);

    var symbolKeys = Object.keys(exchange.markets);

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
        marketIds.push(idToUse);
        marketSymbols.push(symbolToUse);
        marketBases.push(baseToUse);
        marketQuotes.push(quoteToUse);
        marketData.push([idToUse, symbolToUse, baseToUse, quoteToUse]);
      }
    });

    let marketString;
    marketString = market({
      ids: marketIds,
      symbols: marketSymbols,
      bases: marketBases,
      quotes: marketQuotes,
      data: marketData
    });

    redis.set(exchangeKey, marketString);
  }
  console.log("Finished.");
  redis.disconnect();
})();
