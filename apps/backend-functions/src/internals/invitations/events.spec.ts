import { getCollectionRef, loadAdminServices } from '@blockframes/firebase-utils';
import {
  getTestingProjectId,
  initFunctionsTestMock,
  populate,
  eventData,
} from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from '@firebase/testing';
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
    await populate('users', eventData.users);
    await populate('events', eventData.events);
    await populate('invitations', eventData.invitations);

    await createNotificationsForEventsToStart();

    const notifications = await getCollectionRef('notifications');
    expect(notifications.docs.length).toEqual(2);

    // Same call should not trigger more notifications
    await createNotificationsForEventsToStart();

    const notificationsAfterRetry = await getCollectionRef('notifications');
    expect(notificationsAfterRetry.docs.length).toEqual(2);
  });
});
