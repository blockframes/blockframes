import { MovieStore } from '@blockframes/movie/movie/+state/movie.store';
import { Injectable } from '@angular/core';
import { SpectatorService, createServiceFactory, mockProvider, SpyObject } from '@ngneat/spectator/jest';

@Injectable()
class BasketService {
  constructor(private store: MovieStore) {}
  createFireStoreId(): boolean {
    return true;
  }
  createMovie() {
    this.store.add({} as any);
  }
}

describe('BasketService', () => {
  let spectator: SpectatorService<BasketService>;
  let service: BasketService;
  let store: SpyObject<MovieStore>;
  const createService = createServiceFactory({
    service: BasketService,
    providers: [MovieStore]
  });

  beforeEach(() => {
    spectator = createService();
    service = spectator.service;
    store = spectator.get(MovieStore);
  });

  it('should create firestore id', () => {
    expect(service.createFireStoreId()).toBeTruthy();
  });

  it('create movie', () => {
    const spy = spyOn(store, 'add');
    service.createMovie();
    expect(spy).toHaveBeenCalled();
  });
});
