#! /usr/bin/env bash

set -x
set -e

for i in {1..5}; do
    echo $i;

    cp ./env/env.demo${i}.ts ./env/env.ts
    cp ./env/env.demo${i}.ts ./env/env.prod.ts

    npm run build:all

    firebase use demo${i}
    ./secrets.sh demo${i}

    # we deploy everything but functions, they tend to crash
    firebase deploy --except functions

    # we deploy the functions and retry until it worked
    until firebase deploy --only functions || true; do
        echo retry;
        sleep 5;
    done
done
