# Blockframes


## Working with nx

```
# nvm use v9.10
ng generate @nrwl/schematics:node-application eth-events-server
# directory: leave empty
# tags: leave empty
```

## Setup

```
# Copy the template into your env local dev env:
cp ./env/env.template.ts ./env/env.ts
# Then edit it with your values.
```

## Data

### Cloud Storage:

We upload IP documents to the default bucket at path:
`/ip/{ipID}/version/{versionID}`


### Firestore:

We store ip documents version in:

`/ip/{ipID}/version/{versionID}`

We de-normalize the hash at:
`/hash/{documentHash}`

This lets us find the original document (`{ipID, versionID}`)
when a Timestamp event is received from the blockchain.


## eth-events-server

### Notes

For each `{contractName: addresse}` in the environment,
the service will listen to every events and push their content
to a pubsub topic named: `{topicRootName}.{contractName}`.

Something like: `eth-events-server.ScriptHash`

### Setup

In your gcloud project,

Create a service account, with roles:

- pubsub edit (publish messages)
- pubsub edit (manage topics)

Download the keys and export an `env` variable that points to your json key

```
export GOOGLE_APPLICATION_CREDENTIALS=./blockframes-laurent-230215-ccf4f1949393.json
```

### Build & Run with Docker

```
ng build eth-events-server
docker build . --tag=eth-events-server:0.0.1
docker run -v ${PWD}/blockframes-laurent-702feef93c99.json:/app/creds.json \
    --rm -p 3333 -t -i eth-events-server:0.0.1
```
