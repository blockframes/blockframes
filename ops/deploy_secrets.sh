#!/usr/bin/env bash
firebase functions:config:set sendgrid.api_key="${SENGRID_API_KEY}" \
                              relayer.mnemonic="${ETHEREUM_MNEMONIC}"
