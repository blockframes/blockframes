#! /usr/bin/env bash
firebase setup:emulators:firestore
firebase emulators:exec 'nx affected:test --base=origin/master --skip-nx-cache'

