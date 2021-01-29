#! /usr/bin/env bash
firebase setup:emulators:firestore
firebase emulators:exec --only firestore 'nx run user:test'

