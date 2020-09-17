import { Movie as MovieType } from '../utils/type';
import { QueryInferface } from "../utils/queryinterface";
import moviesFixture from 'tools/fixtures/movies.json';

export enum MOVIE {
  Felicità = '1J5uLFThLziaj2j0xPPP',
  Hunted = 'KUFRFI3VQ5HLOdymnEX5',
}

export class Orgs {
  constructor() {

  }

  get(query: QueryInferface) : Partial<MovieType>[] {
    const orgSet: Partial<MovieType>[]  = (query.exist) ? 
                                      moviesFixture : null;

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
  getByID(ID: string) : Partial<MovieType> {
    return this.get({exist: true, key:'id', value: ID})[0];
  }

}