import { Inject, Injectable } from '@angular/core';
import { algolia } from '@env';
import algoliasearch, { SearchIndex } from 'algoliasearch';
import { App } from '../apps';
import { APP } from '../routes/utils';
import { algoliaIndex, AlgoliaObject, AlgoliaQueries, SearchResponse } from './algolia.interfaces';
import { parseFilters, parseFacets } from './helper.utils';

@Injectable({ providedIn: 'root' })
export class AlgoliaService {

  private indices: Record<string, SearchIndex> = {};

  constructor(@Inject(APP) private app: App) {}

  getIndex(name: 'movie' | 'org' | 'user'): SearchIndex {
    if (!this.indices[name]) {
      if (name === 'user') {
        this.indices[name] = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex[name]);
      } else {
        this.indices[name] = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex[name][this.app]);
      }
    }
    return this.indices[name];

  }

  query<K extends keyof AlgoliaQueries>(name: K, config: AlgoliaQueries[K]): Promise<SearchResponse<AlgoliaObject[K]>> {
    return this.getIndex(name).search<AlgoliaObject[K]>(config.text ?? '', {
      hitsPerPage: config.limitResultsTo,
      page: config.activePage,
      facetFilters: parseFacets(config.facets),
      filters: parseFilters(config.filters)
    }).then(e => e);
  }

  multipleQuery(indexGroup: string, text: string) {
    const queries = this.createMultipleQueries(indexGroup, text);
    return algoliasearch(algolia.appId, algolia.searchKey).multipleQueries(queries).then(output => {
      const hits = [];
      output.results.forEach(r => { r.hits.forEach(hit => { if (!hits.some(h => h.objectID === hit.objectID)) hits.push(hit) }) });
      return hits;
    });
  }

  private createMultipleQueries(indexGroup: string, text: string) {
    const queries = [];
    Object.values(algolia[indexGroup]).forEach(indexName => {
      queries.push({
        indexName,
        query: text
      })
    });

    return queries;
  }
}
