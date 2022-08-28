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
pnpm i
nx run redis:up
nx run builder:all
nx ingest-apps:run
```

wait til redis finishes loading

if you want to run the two stat microservices - in seperate terminals open:

```
nx run read-streams:run
```

```
nx run track-streams:run
```

when finished with app run:

```
nx run redis:down
```

and close out of any open terminals

to see the microservices in a local web browser as a graph run:

```
nx graph
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

- eslint - done
- fastjsonstringify - done
- simdjson - in progress
- typescript - in progress: status = not-strict
- break out modules - 70% complete
- make schemas & objects for each data type - not started
- koaland - not started
- grpc - not started
- nx - done
- dapr - not started
- object orientated - not started
- makefile - not started
- github actions - not started
- containerize for kubernetes && docker - not started
- add more exchanges - not started
