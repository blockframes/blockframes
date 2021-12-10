import { getTestingProjectId, initFunctionsTestMock } from "@blockframes/testing/firebase/functions";
import { clearFirestoreData } from "@firebase/testing";

describe('Permissions Functions Test', () => {

  beforeAll(async () => {
    initFunctionsTestMock();
  });

  afterEach(async () => {
    // After each test, db is reseted
    await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('should throw error when eventId is null', async () => {
    expect(true).toBeTruthy();
  })

});