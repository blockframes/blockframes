import * as util from './util'

describe('Test util.ts generator function getCollectionInBatches', () => {
  const { db } = util.loadAdminServices()
  it('should return batches of the correct size', async () => {
    const usersRef = db.collection('users')
    const batchSize = 10
    let iterations = 3;
    expect.assertions(iterations);
    const docs = util.getCollectionInBatches(usersRef, 'uid', batchSize)
    for await (const chunk of docs) {
      expect(chunk.length).toBe(batchSize)
      iterations -= 1;
      if (!iterations) break
    }
  });
});

describe('Test util.ts  function runInBatches', () => {
  it('should return batches of the correct size', async () => {
    const jestMock = jest.fn(() => Promise.resolve())
    await util.runInBatches(Array(9), jestMock, 3)
    expect(jestMock).toHaveBeenCalledTimes(9)
  });
});
