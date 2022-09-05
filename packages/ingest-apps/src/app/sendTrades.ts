import * as Ccxws from 'ccxws';
import { redisServer, redisStream } from '@finjest/ingest';
import Redis from 'ioredis';
import { exchangeIDMap } from '@finjest/ingest';
import * as Util from 'util';
import TSON from "typescript-json";

const globalAny: any = global;
const log = (globalAny.log = (...l: any) => console.log(...l));

const redis = new Redis({
  port: 6379,
  host: '127.0.0.1',
});
const streamToRedis = new Redis({
  port: 6379,
  host: '127.0.0.1',
});

redis.on('error', (err) => log('Redis Client Error', err));

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
  //log(exchangeMarkets);
  const eMarketsObj = JSON.parse(exchangeMarkets);
  log(eMarketsObj);

  var mapObj;
  const marketsMap = new Map();
  for (let k = 0; k < eMarketsObj.ids.length; k++) {
    // marketData.push([idToUse, symbolToUse, baseToUse, quoteToUse]);
    mapObj = eMarketsObj.data[k];
    marketsMap.set(mapObj[0], mapObj);
    marketsMap.set(mapObj[1], mapObj);
    //log(mapObj[0], ":", mapObj);
    //log(mapObj[1], ":", mapObj);
    //log("---------------------------");
  }
  exchangeMarketMap.set(exchangeName, marketsMap);
  //log(exchangeMarketMap);
};

/*******************
 Ticker {
  exchange: 'Binance',
  base: 'STX',
  quote: 'BNB',

 timestamp: 1647265351611,
  sequenceId: undefined,
 last: '0.00331900',
 open: '0.00324700',
 high: '0.00362600',
 low: '0.00331900',
 volume: '64418.60000000',
 quoteVolume: '219.48846580',
  change: '-0.00007200',
  changePercent: '-2.123',
 bid: '0.00332000',
 bidVolume: '108.50000000',
 ask: '0.00332900',
 askVolume: '409.80000000'
}
 */
const streamTicker = async function (ticker) {
  //log(Util.inspect(ticker, false, null, true));
  var streamKey =
    ticker.exchange + ':' + ticker.base + ':' + ticker.quote + ':' + 'ticker';
  //log(await redis.xlen(streamKey));
  //redis.set("lastStreamKey", streamKey);

  streamToRedis.xadd('TestStream', '*', 'key', streamKey);
  /* */
  log(ticker);
  // prettier.ignore
  /*
  streamToRedis.xadd(
    streamKey,
    "*",
    "timestamp",
    ticker.timestamp,
    "last",
    ticker.last,
    "open",
    ticker.open,
    "high",
    ticker.high,
    "low",
    ticker.low,
    "volume",
    ticker.volume,
    "quoteVolume",
    ticker.quoteVolume,
    "bid",
    ticker.bid,
    "ask",
    ticker.ask,
    "askVolume",
    ticker.askVolume
  );
  */
  //log(await redis.xlen(streamKey));
  //log(streamKey, Util.inspect(ticker, false, null, true));
  log(streamKey);
  // log(ticker.Ticker.base);
  // log(ticker.Ticker.quote);
};

/*
Trade {
  exchange: 'Binance',
  quote: 'USDT',
  base: 'BTC',
  tradeId: '1129582738',
  sequenceId: undefined,
  unix: 1648729956179,
  side: 'sell',
  price: '47324.76000000',
  amount: '0.00025000',
  buyOrderId: undefined,
  sellOrderId: undefined
}

{
    "e": "aggTrade",  // Event type
    "E": 123456789,   // Event time
    "s": "BNBBTC",    // Symbol
    "a": 12345,       // Aggregate trade ID
    "p": "0.001",     // Price
    "q": "100",       // Quantity
    "f": 100,         // First trade ID
    "l": 105,         // Last trade ID
    "T": 123456785,   // Trade time
    "m": true,        // Is the buyer the market maker?
    "M": true         // Ignore
  }

  E: event time
  s: symbol ("id");
  p: price
  q: quantity
*/

const streamTrade = async function (trade) {
  // log(Util.inspect(ticker, false, null, true));
  // log("streamTrade:", id);
  var streamKey =
    trade.exchange + ':' + trade.base + trade.quote + ':' + 'trade';
  //log(await redis.xlen(streamKey));
  //redis.set("lastStreamKey", streamKey);
  log(streamKey);
  //log(Util.inspect(trade, false, null, true));
  streamToRedis.xadd('TestStream', '*', 'key', streamKey);
  /* */
  //log(trade);
  // prettier.ignore
  streamToRedis.xadd(
    streamKey,
    '*',
    'E',
    trade.unix,
    //    "s",
    //    trade.base + trade.quote,
    'p',
    parseFloat(trade.price).toString(),
    'q',
    parseFloat(trade.amount).toString()
  );

  log(
    'TRADE: ',
    trade.id,
    trade.base + trade.quote,
    ' @',
    trade.unix,
    ' P:',
    parseFloat(trade.price).toString(),
    ' Q:',
    parseFloat(trade.amount).toString()
  );
  /* */
  //log(await redis.xlen(streamKey));
  //log(streamKey, Util.inspect(ticker, false, null, true));
  //log(streamKey);
  // log(ticker.Ticker.base);
  // log(ticker.Ticker.quote);
};

const webSocketMap = new Map();
const subscriptions = new Map();

class webSocketInfo {
  private subLimit: number;
  private wsClasses: any[];
  constructor() {
    this.subLimit = 25;
    this.wsClasses = [];
  }
}

class webSocketItem {
  wsClass: null;
  private subs: any[];
  constructor() {
    this.wsClass = null;
    this.subs = [];
  }
}

const addSubscription = function (exchange, type, market) {
  log('addSubscription ', exchange, type, market);
  var subKey = exchange + market.id + type;
  if (subscriptions.has(subKey)) {
    log('ABORT ... already subscribed');
    return;
  }
  subscriptions.set(subKey, 1);

  var wsClass;

  if (webSocketMap.has(exchange) == false) {
    log('Need to create wss for ', exchange);

    // need a lot to handle multiple clients
    webSocketMap.set(exchange, new webSocketInfo());
  }
  const theWFI = webSocketMap.get(exchange);
  //log(Util.inspect(theWFI, false, null, true));

  var needWsClass = false;
  if (theWFI.wsClasses.length == 0) {
    needWsClass = true;
  } else {
    if (
      theWFI.wsClasses[theWFI.wsClasses.length - 1].subs.length >=
      theWFI.subLimit
    ) {
      needWsClass = true;
    }
  }

  if (needWsClass) {
    log('Need a New wsClass');
    if (!exchangeIDMap.has(exchange)) {
      log('NO MAPPING for', exchange);
      log('NO MAPPING for', exchange);
      log('NO MAPPING for', exchange);
      return;
    }
    const wsClassName = exchangeIDMap.get(exchange);
    // const wsClassName =
    //   exchange.charAt(0).toUpperCase() + exchange.slice(1) + "Client";
    console.log(wsClassName);
    // log(Ccxws);

    var exchangeClass = Ccxws[wsClassName];
    wsClass = new exchangeClass();
    log(Util.inspect(wsClass, false, null, true));

    wsClass.on('trade', (trade) =>
      //console.log(Util.inspect(ticker, false, null, true))
      streamTrade(trade)
    );
    // retain this websocket class
    const theWFItem = new webSocketItem();
    theWFItem.wsClass = wsClass;
    theWFI.wsClasses.push(theWFItem);
  }

  // Add the subscription
  theWFI.wsClasses[theWFI.wsClasses.length - 1].wsClass.subscribeTrades(market);
  theWFI.wsClasses[theWFI.wsClasses.length - 1].subs.push(market);
};

// -----------------------
export const startStreams = async function () {
  var waitingStreams = await redis.llen('dataStreaming');
  log('len ->', waitingStreams);
  while (waitingStreams > 0) {
    waitingStreams--;
    var oldRequest = await redis.blpop('dataStreaming', 0);
    log('old request', oldRequest);
    oldRequest = JSON.parse(oldRequest[1]);
    //log("old request", oldRequest);
    await redis.rpush('dataRequest', TSON.stringify<T>(oldRequest));
    log('dataRequest llen', await redis.llen('dataRequest'));
  }
  let looping = true;

  while (true) {
    var request = await redis.blpop('dataRequest', 0);

    log(request);
    request = JSON.parse(request[1]);
    log(request['exchange']);
    await redis.rpush('dataStreaming', TSON.stringify<T>(request));
    log('------->>>>', await redis.llen('dataStreaming'));

    var marketMap = exchangeMarketMap.get(request['exchange']);
    if (marketMap == null) {
      await buildMap(request['exchange']);
      marketMap = exchangeMarketMap.get(request['exchange']);
    }

    //log("---->", marketMap);
    if (marketMap != null) {
      var marketRef;

      if ('id' in request) {
        marketRef = request['id'];
      } else {
        marketRef = request['symbol'];
      }

      log('+++>', marketRef);
      if (marketMap.has(marketRef)) {
        const mVals = marketMap.get(marketRef);
        //log(Util.inspect(mVals, false, null, true));
        log('id', request['id'], 'mVals:', mVals);
        const market = {
          id: mVals[0],
          symbol: mVals[1],
          base: mVals[2],
          quote: mVals[3],
        };
        log('>>>>>> Result <<<<<<');
        log(market);
        addSubscription(request['exchange'], request['type'], market);
      } else {
        log('UNKNOWN MARKET: ', marketRef);
      }
    }
  }
};

startStreams().then(() => console.log('streaming starting'));
