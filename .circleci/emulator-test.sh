#! /usr/bin/env bash
# We are using firestore, functions, auth & pubsub emulators for now
# Modify the command as needed
echo "Starting emulators & launching affected unit-tests..."
firebase emulators:exec --only firestore, functions, auth, pubsub 'npx nx affected:test --base=origin/master'

