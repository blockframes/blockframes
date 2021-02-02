#! /usr/bin/env bash
firebase emulators:exec --only firestore 'nx test event --skip-nx-cache && nx test notification --skip-nx-cache && nx test import --skip-nx-cache && nx test invitation  --skip-nx-cache'

