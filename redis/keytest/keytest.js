const redis = require('redis');
global.log = (...l) => console.log(...l);

(async () => {
    const client = redis.createClient();

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    await client.set('foo', 'bar');
    const value = await client.get('foo');
    log(`value of foo is ${value}`)
})();