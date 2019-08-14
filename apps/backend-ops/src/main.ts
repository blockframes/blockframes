import { prepareFirebase } from './firebaseSetup';

async function run() {
  console.info('Preparing firebase...');
  await prepareFirebase();
  console.info('Firebase ready for testing!');
  process.exit(0);
}

run();
