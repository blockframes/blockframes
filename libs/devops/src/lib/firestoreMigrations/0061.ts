import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { App, getAllAppsExcept } from '@blockframes/model';
import { OldStoreConfig } from './old-types';

export async function upgrade(db: Firestore) {

  // Update the CMS setting
  const cms = await db.collection('cms').get();
  cms.docs.map(async cmsDoc => {
    const docRef = await cmsDoc.ref.collection('home').doc('live');
    const doc = await docRef.get();
    const data = doc.data();

    for (const section of data.sections) {
      if(['orgTitles', 'slider', 'titles'].includes(section._type) && !!section.query) {
        const application = section.query[0].field.split('.')[2];
        for (const q of section.query) {
          const array = q.field?.split('.');
          if (!!array && array.includes('storeConfig')) {
            array.length === 3
            ? q.field = `app.${array[2]}.access`
            : q.field = `app.${application}.status`
          }
        }
      }
    }
    await docRef.set(data);
  })

  // Update movies app access
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (movieDoc) => {
    const data = movieDoc.data();

    data.app = createNewAppConfig(data.storeConfig);
    delete data.storeConfig;

    return movieDoc.ref.set(data);
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
