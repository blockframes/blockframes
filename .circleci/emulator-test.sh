#! /usr/bin/env bash
firebase emulators:exec --only firestore 'nx affected:test --base=origin/master --skip-nx-cache'

