import { createClient } from 'redis';
const globalAny: any = global;
globalAny.log = (...l: any) => console.log(...l);

export const redistest = (async () => {
  const client: any = createClient();

  client.on('error', (err: any) => console.log('Redis Client Error', err));

  await client.connect();

  await client.set('foo', 'bar');
  const value = await client.get('foo');
  console.log(`value of foo is ${value}`);
})();
