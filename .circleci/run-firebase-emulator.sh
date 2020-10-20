#! /usr/bin/env bash
firebase use "$PROJECT_ID"
firebase setup:emulators:firestore
firebase functions:config:get > .runtimeconfig.json
firebase emulators:start --only firestore
