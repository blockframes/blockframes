#! /usr/bin/env bash
# We are using firestore emulator for now
# Check Docker file to install other emulators
# Modify the command as needed
echo "Starting emulators & launching affected unit-tests..."
firebase emulators:exec --only firestore 'npx nx affected:test --base=origin/develop'
