#! /usr/bin/env bash
firebase setup:emulators:firestore
firebase emulators:exec --only firestore 'npx nx run user:test && npx nx run rules:test && nx test backend-functions --skip-nx-cache  && nx test backend-ops --skip-nx-cache'

