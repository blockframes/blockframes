import { Movie } from '../utils/type';
import { QueryInferface } from "../utils/queryinterface";
import moviesFixture from 'tools/fixtures/movies.json';

export enum MOVIE {
  Felicità = '1J5uLFThLziaj2j0xPPP',
  Hunted = 'KUFRFI3VQ5HLOdymnEX5',
}

export class Orgs {
  get(query: QueryInferface) : Partial<Movie>[] {
    const orgSet: Partial<Movie>[] = (query.exist) ? moviesFixture : null;

    if (query.index && query.index !== -1) {
      return [orgSet[query.index]];
    }

    if (query.key) {
      return orgSet.filter(u => u[query.key] === query.value);
    }

    return orgSet;
  }

  /**
   * getByID : convenience method to fetch movie by ID
   * @param ID : id of the movie
   */
  getByID(ID: string) : Partial<Movie> {
    return this.get({exist: true, key:'id', value: ID})[0];
  }

}