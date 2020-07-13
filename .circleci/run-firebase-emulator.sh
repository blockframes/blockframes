#! /usr/bin/env bash
firebase functions:config:get > .runtimeconfig.json
firebase emulators:start
