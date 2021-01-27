#! /usr/bin/env bash
firebase setup:emulators:firestore
firebase emulators:exec 'nx run user:test'

