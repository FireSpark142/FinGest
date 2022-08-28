import { Exchange, exchanges } from 'ccxt';
import { attr, sjs } from 'slow-json-stringify';
import { redisServer } from '@finjest/ingest';
import * as ccxt from 'ccxt';

// schema definition
const names = sjs({
  names: attr('array'),
});

const market = sjs({
  ids: attr('array'),
  symbols: attr('array'),
  bases: attr('array'),
  quotes: attr('array'),
  data: attr('array'),
});

const globalAny: any = global;
const log = (globalAny.log = (...l: any) => console.log(...l));
const redis = redisServer;

const exchangeFilters = ['binance', 'kucoin'];

const getMarkets = async (exchangeObj) => {
  await exchangeObj.load_markets();
  let markets;
  console.log(exchangeObj.id, markets);
};

// create a connection to redis
redis.on('error', (err) => console.log('Redis Client Error', err));

export async function mapper() {
  let selectedExchanges = [];

  ccxt.exchanges.forEach((exchange) => {
    exchangeFilters.forEach((filter) => {
      console.log(exchange);
      if (exchange.includes(filter)) {
        selectedExchanges.push(exchange);
      }
    });
  });

  redis.set('exchanges', names({ names: selectedExchanges }));

  let marketCt = 0;

  for (let k = 0; k < selectedExchanges.length; ++k) {
    let exchangeKey = selectedExchanges[k] + 'Markets';
    log(exchangeKey);

    let exchangeClass = ccxt[selectedExchanges[k]];
    console.log(exchangeClass);
    let exchange = new exchangeClass();
    console.log(exchange.markets);

    await getMarkets(exchange);

    let symbolKeys = Object.keys(exchange.markets);

    log(exchange.markets[symbolKeys[0]]);
    log(exchange.markets[symbolKeys[0]].symbol);
    log(exchange.markets[symbolKeys[0]].lowercaseId);
    log(exchange.markets[symbolKeys[0]].id);
    log(exchange.markets[symbolKeys[0]].info.status);

    let marketIds = [];
    let marketSymbols = [];
    let marketBases = [];
    let marketQuotes = [];
    let marketData = [];

    let statusToUse;
    let symbolToUse;
    let idToUse;
    let baseToUse;
    let quoteToUse;

    symbolKeys.forEach((item) => {
      statusToUse = exchange.markets[item].info.status !== 'BREAK';
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
        console.log(marketCt, ': ', symbolToUse, idToUse);
        marketIds.push(idToUse);
        marketSymbols.push(symbolToUse);
        marketBases.push(baseToUse);
        marketQuotes.push(quoteToUse);
        marketData.push([idToUse, symbolToUse, baseToUse, quoteToUse]);
      }
    });
    log(marketData);

    let marketString;
    marketString = market({
      ids: marketIds,
      symbols: marketSymbols,
      bases: marketBases,
      quotes: marketQuotes,
      data: marketData,
    });

    redis.set(exchangeKey, marketString);
    for (let k = 0; k < marketData.length; ++k) {
      log(`${exchangeKey} => ${marketData[k]}`);
    }
  }
  console.log('Finished.');
  redis.disconnect();
}
