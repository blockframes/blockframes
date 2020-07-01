# Blockframes

## Working with nx

```bash
# nvm use v9.10
ng generate @nrwl/schematics:node-application catalog-marketplace
# directory: leave empty
# tags: leave empty
```

### Issues regarding application creation

https://github.com/nrwl/nx/issues/1104


## Environments

Environments variables are used to adapt the application to different execution environment.
The main environments to be aware of are: local development, continuous integration, staging and production.

Each app uses its own `environment/` folder. Shared environments are stored in the root `/env` folder.

## Setup


### Prep your environment

```bash
# Copy the template into your env local dev env:
cp ./env/env.template.ts ./env/env.ts
# Then edit it with your values.
```

### Setup the authentication

- In the firebase console, authentication, enable the email / password auth.
- Create a service account to use the admin locally.

```sh
export GOOGLE_APPLICATION_CREDENTIALS=some/path/service-account-for-your-firebase.json
```

### Setup your secrets

We use this to send emails, configure algolia, etc.

We have secrets that we don't share on the public github, these should be stored in the `secrets.sh` file at the root of the project. By default the ops scripts will use the `secrets.template.sh` file that contains an example of the secrets we use.
\*\*UPDATE: secrets.sh is now deprecated. The new method for storing these secrets is to use a `.env` file. These are simple key="value" pairs, one on each line. The current ops setup is backwards-compatible - so it will still try to parse your secrets.sh and backup secrets.template.sh file. However, this functionality will not remain indefinitley, so you are reccomended to migrate to the new system.

Copy the `secrets.template.sh` to `secrets.sh` and update the values with keys you create on different services.

## Running and testing

```bash
npm run start # starts your server in dev mode, hmr, etc
npm run e2e:dev # starts cypress when your server is already running
npm run lint, npm run test, etc. # check this in your package.json
```


## Deploy

```bash
npm run build:all
firebase deploy
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

*Setup:* in your firebase console, hosting section,
create a bucket called `blockframes-backups` for the backup functions.

### CORS policy

Install gcloud
```
# Example for Linux :
curl https://sdk.cloud.google.com | bash
gcloud init
# For other OS see https://cloud.google.com/storage/docs/gsutil_install
```

Create a file named `cors.json` with:
```
[
    {
      "origin": ["*"],
      "method": ["GET"],
      "maxAgeSeconds": 3600
    }
]
```

Push this file with `gsutil`
```
#https://firebase.google.com/docs/storage/web/download-files
gsutil cors set cors.json gs://blockframes-vincent.appspot.com
rm cors.json
```

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

```bash
export GOOGLE_APPLICATION_CREDENTIALS=./blockframes-laurent-230215-ccf4f1949393.json
```

### Build & Run with Docker

```bash
ng build eth-events-server
docker build . --tag=eth-events-server:0.0.1
docker run -v ${PWD}/blockframes-laurent-702feef93c99.json:/app/creds.json \
    --rm -p 3333 -t -i eth-events-server:0.0.1
```

## Firebase mails templates

Verification emails are send by Firebase, using defined template and configuration. As we got different routes in production, make sure to configure deployed versions of the app accordingly.

Go to Firebase console > Authentication > Templates > ...

Click on the pen to edit the template. At the very bottom of the form, click on `customize action URL`. If this database is used for development, the path should be `https://localhost:4200/...`, if it belongs to production, you should put `https://app.blockframes.io/...`.

You can also customize the message of each type of mail (email verification, password reset, email modification).
