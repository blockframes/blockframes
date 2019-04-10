import express from 'express';
import { Contract, ethers } from 'ethers';
import { PubSub } from '@google-cloud/pubsub';
import { environment } from './environments/environment';
import { contracts, firebase, network } from '@env';

const PUBSUB_ERROR_CODE_ALREADY_EXISTS = 6;

// Keeping the app around to make a status page later
const app = express();

app.get('/', (req, res) => {
  res.send('OK');
});

const port = 3333;
app.listen(port, (err) => {
  if (err) {
    console.error(err);
  }
  console.log(`Listening at http://localhost:${port}`);
});


// Eth Events Service will take care of pushing eth events to our pubsub topics.
const ethEventsService = async () => {
  const { topicRootName } = environment.pubsub;

  const provider = ethers.getDefaultProvider(network);
  const pubsub = new PubSub({ projectID: firebase.projectId });

  const subs = Object.entries(contracts)
    .map(async ([name, addr]) => {

      const topicName = `${topicRootName}.${name}`;

      // Create the topic if it does not exists
      try {
        await pubsub.createTopic(topicName);
      } catch (error) {
        if (error.code !== PUBSUB_ERROR_CODE_ALREADY_EXISTS) {
          throw error;
        }
      }

      // Start the events forwarding from eth to pubsub
      const topic = pubsub.topic(topicName);
      const contract = new Contract(addr, [], provider);

      contract.on('*', event => {
        topic.publish(Buffer.from(JSON.stringify(event)))
          .then(r => console.info('[PUBLISHED]', 'contract:', name, 'topic:', topicName, 'event:', event, 'result:', r))
          .catch(err => console.error('[ERROR]', 'contract:', name, 'topic:', topicName, 'error:', err));
      });

      return {
        addr, name, topicName, topic, contract
      };
    });

  await Promise.all(subs);

  console.info('eth-events-server started with contracts:', contracts);
};

ethEventsService();
