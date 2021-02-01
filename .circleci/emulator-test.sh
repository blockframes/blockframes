#! /usr/bin/env bash
firebase setup:emulators:firestore
firebase emulators:exec --only firestore 'nx affected:test --base=origin/master --skip-nx-cache'

