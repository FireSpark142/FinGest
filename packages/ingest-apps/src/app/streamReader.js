import Redis from "ioredis";

global.log = (...l) => console.log(...l);

const redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
});
redis.on("error", (err) => console.log("Redis Client Error", err));

const readStreams = async function () {
  var keyList = await redis.keys("*ticker");
  // log(keyList);

  var totalMemUsed = 0;
  var memUse = 0;
  var totalTicks = 0;
  var ticks = 0;
  var start = Date.now();

  var timeMap = new Map();

  for (let k = 0; k < keyList.length; k++) {
    timeMap.set(keyList[k], 0);

  }

  for (let k = 0; k < keyList.length; k++) {
    let operationStart;
    operationStart = Date.now();
    memUse = await redis.memory("USAGE", keyList[k]);
    ticks = await redis.xlen(keyList[k]);
    totalMemUsed += memUse;
    totalTicks += ticks;
    var ticksRead = 0;
    var sdat = await redis.xread("STREAMS", keyList[k], 0);
    // log(Util.inspect(sdat, false, null, true));

    // prettier-ignore
    log(k, ":> ", keyList[k], ":", ticks, " >> ", memUse,
        "bytes, taking", Date.now() - operationStart, "ms"
    );
  }
  // prettier-ignore
  log(totalTicks, "ticks in ", totalMemUsed / (1024 * 1024), "MB, ",
      totalMemUsed / totalTicks, "bytes/tick ", Date.now() - start, "ms"
  );
  // redis.disconnect();
};

readStreams();
