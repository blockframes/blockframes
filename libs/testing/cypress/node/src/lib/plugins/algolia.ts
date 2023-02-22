import { db } from '../testing-cypress';
import { storeSearchableOrg, storeSearchableMovie, indexBuilder } from '@blockframes/firebase-utils/algolia';
import { Organization, Movie, AlgoliaApp } from '@blockframes/model';
import { algolia } from '@env';

export async function storeOrganization(org: Organization) {
  return await storeSearchableOrg(org, process.env['ALGOLIA_API_KEY'], db);
}

export async function storeMovie({ movie, orgs }: { movie: Movie; orgs: Organization[] }) {
  return await storeSearchableMovie(movie, orgs, process.env['ALGOLIA_API_KEY']);
}

export async function deleteAlgoliaMovie({ app, objectId }: { app: AlgoliaApp; objectId: string }) {
  return await indexBuilder(algolia.indexNameMovies[app], process.env['ALGOLIA_API_KEY']).deleteObject(objectId);
}

export async function deleteAlgoliaOrg({ app, objectId }: { app: AlgoliaApp; objectId: string }) {
  return await indexBuilder(algolia.indexNameOrganizations[app], process.env['ALGOLIA_API_KEY']).deleteObject(objectId);
}
