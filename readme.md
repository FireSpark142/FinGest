This is a major work in progress right now -

//Please be aware of this - this is major work in progress

///Backstory is a dear friend of mine who shall be referenced as only Wayne, started this project.

///It's now a project I plan to finish

///The plan is a state of the art streaming financial transactional data ingestion system, performance above everything.

///The goal is a containerized application you can run on any system to consume the stream via the language of your
choice

***

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

* eslint
* prettier
* fastjsonstringify
* simdjson - need to fork from luizperes && update his package if possble
* typescript
* koaland
* grpc
* nx
* dapr
* object orientated
* makefile
* github actions
* containerize for kubernetes && docker
    
    
    
