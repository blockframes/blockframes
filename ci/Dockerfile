# Our ci container:
#   - use the regular, simple, circleci node image
#   - add libraries required by cypress
#
# The image shall be pushed to dockerhub:
#    docker build -t blockframes/ci:latest .
#    docker push blockframes/ci:latest
#
FROM circleci/node:9

# Required cypress packages
RUN sudo apt-get -y install xvfb libgtk2.0-0 libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2
