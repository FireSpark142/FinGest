This is a major work in progress right now -

//Please be aware of this - there's nothing completely functional right now

///Backstory is a dear friend of mine who shall be referenced as only Wayne, started this project.

///It's now a project I plan to finish

///The plan is a state of the art streaming financial transactional data ingestion system, performance above everything.

///The goal is a containerized application you can run on any system to consume the stream via the language of your
choice

***

Use pnpm a module if you need to install instead of npm

symbolmapper.js Produces key/value pairs to map the exchange id to ccxt symbol.

The ccxt symbol is necessary for rest APIs.
To see results use redis. In redis clone:

docker-compose up
redis-servers

In this clone: node symbolmapper.js
To see results:

- to do

Roadmap:
Document Heavily
Refactor with following architecture in order:
* eslint
* prettier
* fastjsonstringify
* simdjson - need to fork from luizperes && update his package if possble
* typescript
* koa
* nx
* dapr
* object orientated
* makefile
* github actions
* containerize for kubernetes && docker
    
    
    
