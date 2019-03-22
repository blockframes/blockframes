import { MovieQuery } from './movie.query';
import { MovieStore } from './movie.store';

describe('MovieQuery', () => {
  let query: MovieQuery;

  beforeEach(() => {
    query = new MovieQuery(new MovieStore);
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

});
