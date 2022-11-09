import { Inject, Injectable } from '@angular/core';
import { AlgoliaObject, AlgoliaQueries, App, BackendSearchOptions } from '@blockframes/model';
import { algolia } from '@env';
import algoliasearch, { SearchIndex } from 'algoliasearch';
import { APP } from '../routes/utils';
import { parseFilters, parseFacets, algoliaIndex } from './helper.utils';
import { SearchResponse } from '@algolia/client-search';
import { CallableFunctions } from 'ngfire';

@Injectable({ providedIn: 'root' })
export class AlgoliaService {

  private indices: Record<string, SearchIndex> = {};

  backendSearch = this.functions.prepare<BackendSearchOptions, SearchResponse<any> & { moviesToExport: any }>('searchWithAlgolia'); // TODO #8894 any

  constructor(
    private functions: CallableFunctions,
    @Inject(APP) private app: App
  ) { }

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
