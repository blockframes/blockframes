#! /usr/bin/env bash
firebase setup:emulators:firestore
firebase emulators:exec --only firestore 'npx nx run user:test'

