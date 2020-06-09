#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

export ENV=ci
export NODE_OPTIONS="--max_old_space_size=7168"
export GOOGLE_APPLICATION_CREDENTIALS="creds.json"
export TERM=xterm-256color

echo "export ADMIN_PASSWORD=\"${CI_ADMIN_PASSWORD}\"" >> $BASH_ENV
echo "${FIREBASE_CI_SERVICE_ACCOUNT}" > creds.json

npx firebase use ci

npx firebase deploy --only firestore,hosting:catalog,hosting:festival

npx firebase deploy --only functions --force || true

echo "building for env: $ENV"
npx ng build backend-ops --configuration=$ENV

echo "prepare the ci for testing"
npm run build:backend-ops && node dist/apps/backend-ops/main.js prepareForTesting

echo "wait for maintenance mode to end (slightly more than 8 minutes)"
sleep 500

npm run e2e:catalog && test1=$? || test1=$?
npm run e2e:festival && test2=$? || test2=$?

exit $(($test1 + $test2)) # we want to exit on error if any test exit is non-zero => sum the exit codes