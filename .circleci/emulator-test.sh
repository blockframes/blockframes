#! /usr/bin/env bash
firebase emulators:exec --only firestore 'npx nx affected:test --base=origin/master --skip-nx-cache'

