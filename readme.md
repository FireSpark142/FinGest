This is a major work in progress right now -

//Please be aware of this - this is major work in progress

///Backstory is a dear friend of mine who shall be referenced as only Wayne, started this project.

///It's now a project I plan to finish

///The plan is a state of the art streaming financial transactional data ingestion system, performance above everything.

///The goal is a containerized application you can run on any system to consume the stream via the language of your
choice

## Currently only supports Binance && Binance Futures data

---

how to use:

```
cd /redis
docker-compose up
```

wait til redis finishes loading

```
npm i pnpm
pnpm i
pnpm run map
```

wait til complete

```
pnpm run trades
```

To see results locally in terminal:

```
pnpm run track
```

```
pnpm run read
```

to connect to the redis server - use the redis client package of your language choice - and configure the server
settings to:

```
port: 6379
host: 127.0.0.1
```

- to do

Roadmap:
Document Heavily
Refactor with following architecture in order:

- slow-json-stringify everything
- simdjson everything
  - pull the package and make clone, revamp it - use latest simdjson spec
- update got with undici
- rewrite and update packages as needed in koa-revamp
- rewrite and update packages as needed in koa-revamp
- decide if u want koaland or not (probably not)
- rewrite and update packages as needed in socketcluster-server-revamp
- rewrite and update packages as needed in socketcluster-client-revamp
- rewrite and update packages as needed in socketcluster-revamp
  - migrate from express to koa
- rewrite ccwxs - pretty much everything - to use socketcluster-revamp
- typescript everything
- release revamps of every sub app as separate projects
- drink beer cause ur already done with part 1
- break out modules
- make schemas & objects for each data type
- dapr ?
- revisit redis vs zudu vs custom inhouse data buffering thing
- makefile
- github actions
