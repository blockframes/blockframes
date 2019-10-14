#!/usr/bin/env ts-node
const path = require('path');

const type = process.argv[2];
const filename = process.argv[3];


// deploy_secrets.sh
if (type === "deploy" && filename === "secrets") {

  const SECRETS = path('./secrets.sh');
  const SECRETS_TEMPLATE = path('secrets.template.sh');

  const TOKEN_ARG = ""
}

