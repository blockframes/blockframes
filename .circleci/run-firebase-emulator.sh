#! /usr/bin/env bash
firebase use "$ENV"
firebase functions:config:get > .runtimeconfig.json
firebase emulators:start
