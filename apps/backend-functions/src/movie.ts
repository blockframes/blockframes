import { functions, db } from './internals/firebase';
import { MovieDocument, OrganizationDocument } from './data/types';
import { createNotification, NotificationType } from '@blockframes/notification/types';
import { App } from '@blockframes/utils/apps';
import { triggerNotifications } from './notification';
import { flatten, isEqual } from 'lodash';

export async function onMovieUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
): Promise<any> {
  const before = change.before.data() as MovieDocument;
  const after = change.after.data() as MovieDocument;

  const hasTitleChanged = !isEqual(before.main.title, after.main.title);

  if (hasTitleChanged) {
    const orgsSnapShot = await db
      .collection(`orgs`)
      .where('movieIds', 'array-contains', after.id)
      .get();

    const orgs = orgsSnapShot.docs.map(org => org.data() as OrganizationDocument);

    const notifUser = (userId: string) =>
      createNotification({
        userId,
        type: NotificationType.movieTitleUpdated,
        app: App.blockframes,
        movie: {
          id: before.id,
          title: {
            international: before.main.title.international,
            original: before.main.title.original
          }
        }
      });

    const notifications = flatten(orgs.map(org => org.userIds.map(userId => notifUser(userId))));

    return triggerNotifications(notifications);
  }
}
