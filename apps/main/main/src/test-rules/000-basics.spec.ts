import { setup, teardown } from './helpers';
import { mockData, userMax } from './mock';

describe('Database rules', () => {
  let db;

  // Applies only to tests in this describe block
  beforeAll(async () => {
    db = await setup(userMax, mockData);
  });

  afterAll(async () => {
    await teardown();
  });

  test('fail when reading a random collection', async () => {
    const ref = db.collection('some-collection');
    await expect(ref.get()).toDeny();
  });

  test('fail when writing a random collection', async () => {
    const ref = db.collection('some-collection');
    await expect(ref.add({ hello: 'world' })).toDeny();
  });
});
