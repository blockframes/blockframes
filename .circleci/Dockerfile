# Our ci container:
#   - use the regular, simple, circleci node image
#   - add libraries required by cypress
#
# The image shall be pushed to dockerhub:
#    docker build -t blockframes/ci:latest .
#    docker push blockframes/ci:latest
#
FROM circleci/node:12-browsers

# Required cypress packages
RUN sudo apt-get -y install xvfb libgtk2.0-0 libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2

# Add vim for debugging purposes
RUN sudo apt-get -y install vim

## Install Java
RUN sudo apt-get update && \
    sudo apt-get install -y openjdk-8-jdk && \
    sudo apt-get install -y ant && \
    sudo apt-get clean;

# Fix certificate issues
RUN sudo apt-get update && \
    sudo apt-get install ca-certificates-java && \
    sudo apt-get clean && \
    sudo update-ca-certificates -f;

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

## Install firebase and the emulator (requires java)
RUN sudo npm install --global firebase-tools
RUN firebase setup:emulators:firestore

## Install gcloud and gsutil for bucket backup facilities
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN sudo apt-get install apt-transport-https ca-certificates gnupg -q -y
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
RUN sudo apt-get update -q -y && sudo apt-get install google-cloud-sdk -q -y
RUN gcloud config set pass_credentials_to_gsutil true

# Used in CI
ENV GOOGLE_APPLICATION_CREDENTIALS /home/circleci/repo/tools/credentials/creds.json
ENV NODE_OPTIONS --max_old_space_size=7168
ENV PROJECT_ID blockframes-ci
ENV NG_CONFIG ci
ENV SERVICE_ACCOUNT FIREBASE_CI_SERVICE_ACCOUNT
