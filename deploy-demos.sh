#! /usr/bin/env bash
set -x
set -e

export NODE_OPTIONS="--max_old_space_size=8192"

git checkout demo
TAG="demo-$(date +'%Y%m%d%H%M')"

for i in {1..5}; do
  echo $i
  export ENV=prod

  cp ./env/demo/env.demo${i}.ts ./env/env.ts
  cp ./env/demo/env.demo${i}.ts ./env/env.prod.ts

  ENV=prod npx ng lint
  ENV=prod npm run build:all

  cp ./package.json dist/apps/backend-functions/

  firebase use demo${i}
  ./secrets.sh demo${i}
  ./ops/deploy_secrets.sh

  # we deploy everything but functions, they tend to crash
  firebase deploy --except functions

  # we deploy the functions and retry until it worked
  until firebase deploy --only functions; do
    echo retry
    sleep 5
  done

  scp -r dist/apps/* blockframes:~/www/www-data/demo${i}/
done

git tag "${TAG}"
git push origin "${TAG}"
