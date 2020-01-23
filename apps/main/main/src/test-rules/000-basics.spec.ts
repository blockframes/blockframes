import { setup, teardown } from './helpers';
import { mockData, userMax } from './mock';

describe('database rules: basic', () => {
  let db;

  beforeAll(async () => {
    try {
      db = await setup(userMax, mockData);
    } catch (error) {
      throw error;
    }
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
