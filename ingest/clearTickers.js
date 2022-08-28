import Redis from "ioredis";

global.log = (...l) => console.log(...l);

const redis = new Redis({
  port: 6379,
  host: "127.0.0.1",
});
redis.on("error", (err) => console.log("Redis Client Error", err));

const readStreams = async function () {
  var keyList = await redis.keys("*trade");
  log(keyList);

  for (let k = 0; k < keyList.length; k++) {
    await redis.del(keyList[k]);
    log(keyList[k], " deleted");
  }
  redis.disconnect();
};

readStreams();
