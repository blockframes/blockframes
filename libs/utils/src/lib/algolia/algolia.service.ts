import { Injectable } from "@angular/core";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { algolia } from '@env';
import algoliasearch, { Index } from 'algoliasearch';
import { App, getCurrentApp } from "../apps";
import { algoliaIndex, AlgoliaQuery, MovieIndexConfig, } from "./algolia.interfaces";
import { parseFilters } from './helper.utils';

@Injectable({ providedIn: 'root' })
export class AlgoliaService {

    movieIndex: Index;
    orgIndex: Index;
    userIndex: Index;
    private appName: App;

    constructor(private routerQuery: RouterQuery) {
        this.appName = getCurrentApp(this.routerQuery);
        this.movieIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex.movie[this.appName])
        this.orgIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex.org[this.appName])
        this.userIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex.user[this.appName])
    }

    queryMovies(query: AlgoliaQuery<MovieIndexConfig>) {
        return this.movieIndex.search({
            query: query.text ?? '',
            hitsPerPage: query.limitResultsTo,
            page: query.activePage,
            facetFilters: this.parseFacets(query.facets),
            filters: parseFilters(query.filters)
        })
    }

    queryOrgs(query: AlgoliaQuery<MovieIndexConfig>) {
        return this.orgIndex.search({
            query: query.text ?? '',
            hitsPerPage: query.limitResultsTo,
            page: query.activePage,
            facetFilters: this.parseFacets(query.facets),
            filters: parseFilters(query.filters)
        })
    }
    queryUsers(query: AlgoliaQuery<MovieIndexConfig>) {
        return this.userIndex.search({
            query: query.text ?? '',
            hitsPerPage: query.limitResultsTo,
            page: query.activePage,
            facetFilters: this.parseFacets(query.facets),
            filters: parseFilters(query.filters)
        })
    }

    private parseFacets(facet: Record<string, any>, prefix?: string): string[] {
        if (!facet) return [];
        const facets = [];
        for (const [key, value] of Object.entries(facet)) {
            const path = [prefix, key].filter(v => !!v).join('.');
            let result: string[];
            if (value === null || value === undefined) {
                result = undefined;
            } else if (Array.isArray(value)) {
                result = value.map(v => `${path}:${v}`);
            } else if (typeof value === 'object') {
                result = this.parseFacets(value, path).flat();
            } else {
                result = [`${path}:${value}`];
            }
            if (result) facets.push(result);
        }
        return facets;
    }

}
