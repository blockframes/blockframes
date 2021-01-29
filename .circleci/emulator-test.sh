#! /usr/bin/env bash
firebase setup:emulators:firestore
firebase emulators:exec --only firestore 'cross-env nx run user:test'

