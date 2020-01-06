import { MovieStore } from '@blockframes/movie/movie/+state';
import { Injectable } from '@angular/core';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator/jest';

@Injectable()
class CartService {
  constructor(private store: MovieStore) {}
  createFireStoreId(): boolean {
    return true;
  }
  createMovie() {
    this.store.add({} as any);
  }
}

describe('CartService', () => {
  let spectator: SpectatorService<any>;
  const createService = createServiceFactory({
    service: CartService,
    mocks: [MovieStore]
  });

  beforeEach(() => (spectator = createService()));

  it('should create firestore id', () => {
    expect(spectator.service.createFireStoreId).toBeTruthy();
  });

  it('create movie', () => {
    spectator.service.createMovie();
    expect(spectator.get(MovieStore).add).toHaveBeenCalled();
  });
});
