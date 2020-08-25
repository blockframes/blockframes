
#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

export ENV=ci
export NODE_OPTIONS="--max_old_space_size=7168"
export GOOGLE_APPLICATION_CREDENTIALS="creds.json"
export TERM=xterm-256color

## ! Use a special service account with permossionsOn both? or two service account keys? (if uploading from dir?)
echo "${FIREBASE_CI_SERVICE_ACCOUNT}" > creds.json

gcloud auth activate-service-account --key-file=creds.json
gcloud --quiet config set project ${ENV}
gcloud info
gsutil -m cp -r gs://blockframes.appspot.com "gs://blockframes-ci-storage-backup/storage-backup-$(date +%d-%m-%Y)/"
