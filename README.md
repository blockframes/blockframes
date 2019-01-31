# Blockframes


## Working with nx

```
# nvm use v9.10
ng generate @nrwl/schematics:node-application eth-events-service
# directory: leave empty
# tags: leave empty
```

## eth-events-service

### Notes

For each `{contractName: addresse}` in the environment,
the service will listen to every events and push their content
to a pubsub topic named: `{topicRootName}.{contractName}`.

Something like: `eth-events-service.ScriptHash`

### Setup

In your gcloud project,

Create a service account, with roles:

- pubsub edit (publish messages)
- pubsub edit (manage topics)

Download the keys and export an `env` variable that points to your json key

```
export GOOGLE_APPLICATION_CREDENTIALS=./blockframes-laurent-230215-ccf4f1949393.json
```
