import { db } from '../testing-cypress';
import { storeSearchableOrg, storeSearchableMovie, indexBuilder } from '@blockframes/firebase-utils/algolia';
import { Organization, Movie, App } from '@blockframes/model';
import { algolia } from '@env';

export async function storeOrganization(org: Organization) {
  return await storeSearchableOrg(org, process.env['ALGOLIA_API_KEY'], db);
}

export async function storeMovie({ movie, organizationNames }: { movie: Movie; organizationNames: string[] }) {
  return await storeSearchableMovie(movie, organizationNames, process.env['ALGOLIA_API_KEY']);
}

export async function deleteAlgoliaMovie({ app, objectId }: { app: Exclude<App, 'crm'>; objectId: string }) {
  return await indexBuilder(algolia.indexNameMovies[app], process.env['ALGOLIA_API_KEY']).deleteObject(objectId);
}

export async function deleteAlgoliaOrg({ app, objectId }: { app: Exclude<App, 'crm'>; objectId: string }) {
  return await indexBuilder(algolia.indexNameOrganizations[app], process.env['ALGOLIA_API_KEY']).deleteObject(objectId);
}
