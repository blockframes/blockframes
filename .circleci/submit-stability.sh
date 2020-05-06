#!/usr/bin/env bash

# Basics from: https://kvz.io/blog/2013/11/21/bash-best-practices/
set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

# Set magic variables for current file & dir
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__file="${__dir}/$(basename "${BASH_SOURCE[0]}")"
__base="$(basename ${__file} .sh)"
__root="$(cd "$(dirname "${__dir}")" && pwd)" # <-- change this as it depends on your app

cd "$1"

zip test-results.zip ./*.xml

# https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables

curl -X POST -F file=@./test-results.zip "${DASHBOARD_API_URL}" \
  --header "Branch:${CIRCLE_BRANCH}" \
  --header "BuildID:${CIRCLE_BUILD_NUM}" \
  --header "BuildURL:${CIRCLE_BUILD_URL}" \
  --header "PR:${CIRCLE_PULL_REQUEST}" \
  --header "User:${CIRCLE_USERNAME}" \
  --header "X-Secret:${DASHBOARD_API_KEY}"