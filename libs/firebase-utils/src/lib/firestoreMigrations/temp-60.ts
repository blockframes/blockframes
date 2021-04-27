import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';
import { App, getAllAppsExcept } from '@blockframes/utils/apps';
import { OldStoreConfig } from './old-types';

export async function upgrade(db: Firestore) {

  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (movieDoc) => {
    const data = movieDoc.data();

    data.app = createNewAppConfig(data.storeConfig);
    delete data.storeConfig;

    await movieDoc.ref.set(data);
  });
}

function createNewAppConfig(storeConfig: OldStoreConfig) {
  const appConfig = {};
  for (const a of getAllAppsExcept(['crm'])) {
    appConfig[a] = createAppConfig(storeConfig, a);
  }
  return appConfig;
}

function createAppConfig(storeConfig: OldStoreConfig, appli: Partial<App>) {
  const isAccepted = storeConfig?.appAccess[appli];
  return {
    status: isAccepted ? storeConfig.status : 'draft',
    access: isAccepted || false,
    acceptedAt: null,
    refusedAt: null,
  }
}
