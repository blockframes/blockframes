FROM node:10

WORKDIR /app
COPY package*.json ./

RUN npm install --only=production
COPY dist/apps/eth-events-server ./
EXPOSE 3333

ENV GOOGLE_APPLICATION_CREDENTIALS "./creds.json"
CMD [ "node", "./main.js" ]
