#!/usr/bin/env bash
SECRETS=./secrets.sh
SECRETS_TEMPLATE=./secrets.template.sh

TOKEN_ARG=""

# ci deployement
if [ -n "${FIREBASE_CI_TOKEN}" ]; then
  TOKEN_ARG="--token ${FIREBASE_CI_TOKEN}"
fi

# Check that we have the configuration in memory,
# If we don't, load from the local secrets file.
# This file is for developers' local environment.
if [ -z "${SENDGRID_API_KEY}" ] || [ -z "${ETHEREUM_MNEMONIC}" ]; then
  echo -e "\e[33mno configuration found in your env, loading your secrets\e[0m"

  if [ -f "$SECRETS" ]; then
    source ${SECRETS};
  else
    echo -e "\e[31mno secrets.sh file found, using secrets.template.sh";
    echo -e "(this is not secure, don't use for production!)\e[0m";
    echo -e "\e[31mpress enter to continue the deploy\e[0m";
    read -n 1 -s -r;
    source ${SECRETS_TEMPLATE};
  fi
fi


echo "deploying the functions configuration"
firebase functions:config:set sendgrid.api_key="${SENDGRID_API_KEY}" \
                              relayer.mnemonic="${ETHEREUM_MNEMONIC}" \
                              algolia.api_key="${ALGOLIA_API_KEY}" \
                              admin.password="${ADMIN_PASSWORD}" \
                              admin.email="${CASCADE8_ADMIN}" \
                              ${TOKEN_ARG};
