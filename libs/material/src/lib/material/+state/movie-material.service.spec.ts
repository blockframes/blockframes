import { SpectatorService, createServiceFactory } from '@ngneat/spectator/jest';
import { AngularFireModule } from '@angular/fire';
import { initializeTestApp } from '@firebase/testing';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { MaterialStore } from './material.store';
import { MovieMaterialService } from './movie-material.service';
import { MovieQuery } from '@blockframes/movie';
import { CollectionService } from 'akita-ng-fire';
import { Material, MaterialStatus } from './material.model';

const initTestApp = initializeTestApp({
  projectId: 'my-test-project',
  auth: { uid: 'alice', email: 'alice@example.com' }
});

const materialsMock = [
  {
    category: 'cat1',
    currency: 'AUD',
    description: 'des1',
    id: '6hjACiAe2dOZ8Vab1L3u',
    isOrdered: false,
    isPaid: false,
    owner: null,
    price: 40,
    status: 'pending',
    stepId: null,
    storage: null,
    value: 'mat1'
  },
  {
    category: 'cat2',
    currency: 'CAD',
    description: 'des2',
    id: 'KfN4o33h4mK212ZnOO5m',
    isOrdered: false,
    isPaid: false,
    owner: null,
    price: 10,
    status: 'pending',
    stepId: null,
    storage: null,
    value: 'mat2'
  },
  {
    category: 'cat3',
    currency: null,
    description: 'des3',
    id: 'dCe0XJLUChDMzJ6p4dZK',
    isOrdered: false,
    isPaid: false,
    owner: null,
    price: null,
    status: 'pending',
    stepId: null,
    storage: null
  }
] as Material[];

describe('MovieMaterialService unit test', () => {
  let spectator: SpectatorService<MovieMaterialService>;
  let movieMaterialService: MovieMaterialService;

  const createService = createServiceFactory({
    service: MovieMaterialService,
    imports: [
      AngularFireModule.initializeApp(initTestApp),
      AngularFireFunctionsModule,
      AngularFirestoreModule
    ],
    mocks: [AngularFirestore],
    providers: [MovieQuery, MaterialStore]
  });

  beforeEach(() => {
    spectator = createService();
    movieMaterialService = spectator.get(MovieMaterialService);
  });

  it('should be created', () => {
    expect(movieMaterialService).toBeTruthy();
  });

  it('should update status of materials from a movie', () => {
    const spy = jest.spyOn(CollectionService.prototype, 'update').mockImplementation();
    movieMaterialService.updateStatus(materialsMock, MaterialStatus.available);
    expect(spy).toHaveBeenCalledWith(['6hjACiAe2dOZ8Vab1L3u', 'KfN4o33h4mK212ZnOO5m', 'dCe0XJLUChDMzJ6p4dZK'], { status: MaterialStatus.available });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should update isOrdered materials from a movie', () => {
    const spy = jest.spyOn(CollectionService.prototype, 'update').mockImplementation();
    movieMaterialService.updateIsOrdered(materialsMock);
    expect(spy).toHaveBeenCalledWith(['6hjACiAe2dOZ8Vab1L3u', 'KfN4o33h4mK212ZnOO5m', 'dCe0XJLUChDMzJ6p4dZK'], (() => ({ isOrdered: true })));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should update isPaid materials from a movie', () => {
    const spy = jest.spyOn(CollectionService.prototype, 'update').mockImplementation();
    movieMaterialService.updateIsPaid(materialsMock);
    expect(spy).toHaveBeenCalledWith(['6hjACiAe2dOZ8Vab1L3u', 'KfN4o33h4mK212ZnOO5m', 'dCe0XJLUChDMzJ6p4dZK'], { status: MaterialStatus.available });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
