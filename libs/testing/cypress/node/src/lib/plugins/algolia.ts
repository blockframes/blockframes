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
  const builder = getIndexBuilder(app, 'movies');
  return await builder.deleteObject(objectId);
}

export async function deleteAlgoliaOrg({ app, objectId }: { app: AlgoliaApp; objectId: string }) {
  const builder = getIndexBuilder(app, 'orgs');
  return await builder.deleteObject(objectId);
}

export async function deleteAlgoliaTestMovies(app: AlgoliaApp) {
  const builder = getIndexBuilder(app, 'movies');
  const search = await builder.search('E2E', {
    attributesToRetrieve: ['title.international'],
  });
  if (!search.nbHits) return false;
  const movies = search.hits;
  return await builder.deleteObjects(movies.map(m => m.objectID));
}

function getIndexBuilder(app: AlgoliaApp, index: 'movies' | 'orgs') {
  const apiKey = process.env['ALGOLIA_API_KEY'];
  if (index === 'movies') return indexBuilder(algolia.indexNameMovies[app], apiKey);
  if (index === 'orgs') return indexBuilder(algolia.indexNameOrganizations[app], apiKey);
}
