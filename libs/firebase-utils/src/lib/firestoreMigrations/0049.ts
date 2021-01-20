import { Firestore } from '@blockframes/firebase-utils';
import { MovieDocument } from '@blockframes/movie/+state/movie.firestore';
import { getDocument, runChunks } from '../firebase-utils';
import { OrganizationDocument } from '@blockframes/organization/+state/organization.firestore'

export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();

  await runChunks(movies.docs, async (movie) => {
    const data = movie.data() as MovieDocument;

    if (!data._meta.createdAt) {
      if(data.orgIds.length) {
        const org = await getDocument<OrganizationDocument>(`orgs/${data.orgIds[0]}`);
        data._meta.createdAt = org._meta.createdAt;
        await movie.ref.set(data);
      } else {
        console.error(`movie ${movie.id} is not linked to any org... skipped update of "_meta.createdAt"`);
      }
    }
  });
}
