#! /usr/bin/env bash
firebase emulators:exec --only firestore 'npx nx run event:test --skip-nx-cache && npx nx run notification:test --skip-nx-cache && npx nx run import:test --skip-nx-cache && npx nx run invitation:test  --skip-nx-cache'

