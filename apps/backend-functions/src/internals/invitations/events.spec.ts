import { getCollectionRef, loadAdminServices } from '@blockframes/firebase-utils';
import {
  getTestingProjectId,
  initFunctionsTestMock,
  populate,
  eventFixtures,
} from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { createNotificationsForEventsToStart } from './events';

describe('Events tests', () => {
  beforeAll(async () => {
    initFunctionsTestMock();
    loadAdminServices();
  });

  afterEach(async () => {
    // After each test, db is reseted
    await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('should create one notification to users with accepted invitation if events are about to start', async () => {
    // Load our test set
    await populate('users', eventFixtures.users);
    await populate('events', eventFixtures.events);
    await populate('invitations', eventFixtures.invitations);

    await createNotificationsForEventsToStart();

    const notifications = await getCollectionRef('notifications');
    expect(notifications.docs.length).toEqual(2);

    // Same call should not trigger more notifications
    await createNotificationsForEventsToStart();

    const notificationsAfterRetry = await getCollectionRef('notifications');
    expect(notificationsAfterRetry.docs.length).toEqual(2);
  });
});
