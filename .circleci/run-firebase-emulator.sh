#! /usr/bin/env bash
firebase use "$NG_CONFIG"
firebase setup:emulators:firestore
firebase functions:config:get > .runtimeconfig.json
firebase emulators:start --only firestore
