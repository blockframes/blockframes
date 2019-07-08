#!/usr/bin/env bash

SECRETS=./secrets.sh
SECRETS_TEMPLATE=./secrets.template.sh

if [ -z "${SENDGRID_API_KEY}" ] || [ -z "${ETHEREUM_MNEMONIC}" ]; then
  echo -e "\e[33mno configuration found in your env, loading your secrets\e[0m"

  if [ -f "$SECRETS" ]; then
    source ${SECRETS};
  else
    echo -e "\e[31mno secrets.sh file found, using secrests.template.sh";
    echo -e "(this is not secure, don't use for production!)\e[0m";
    echo -e "\e[31mpress enter to continue the deploy\e[0m";
    read -n 1 -s -r;
    source ${SECRETS_TEMPLATE};
  fi
fi

echo "deploying the functions configuration"
firebase functions:config:set sendgrid.api_key="${SENDGRID_API_KEY}" \
                              relayer.mnemonic="${ETHEREUM_MNEMONIC}";
