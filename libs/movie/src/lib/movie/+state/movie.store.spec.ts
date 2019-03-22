import { MovieStore } from './movie.store';

describe('MovieStore', () => {
  let store: MovieStore;

  beforeEach(() => {
    store = new MovieStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
