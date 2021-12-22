import { getTestingProjectId, initFunctionsTestMock } from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { endMaintenance, isInMaintenance, startMaintenance } from '@blockframes/firebase-utils';

describe('Check if maintenance mode is working', () => {

  beforeAll(async () => {
    initFunctionsTestMock();
  });

  afterAll(async () => {
    // After each test, db is reseted
    await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('check if maintenance mode is on', async () => {
    // Given fixtures, maintenance mode should be off
    expect(await isInMaintenance()).toEqual(true);
  });

  it('check if maintenance mode can be turned off', async () => {
    await startMaintenance();
    expect(await isInMaintenance()).toEqual(true);
  });

  it('check if maintenance mode can be switched on and off', async () => {
    await startMaintenance();
    expect(await isInMaintenance()).toEqual(true);
    await endMaintenance();
    expect(await isInMaintenance()).toEqual(false);
  });

})
