import { SpectatorService, createServiceFactory } from '@ngneat/spectator/jest';
import { AngularFireModule } from '@angular/fire';
import { initializeTestApp } from '@firebase/testing';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { MaterialStore } from './material.store';
import { MovieMaterialService } from './movie-material.service';
import { MovieQuery } from '@blockframes/movie';
import { MaterialStatus, createMaterial } from './material.model';

const initTestApp = initializeTestApp({
  projectId: 'my-test-project',
  auth: { uid: 'alice', email: 'alice@example.com' }
});

const materialsMock = [
  createMaterial({
    category: 'cat1',
    currency: 'AUD',
    description: 'des1',
    id: '6hjACiAe2dOZ8Vab1L3u',
    price: 40,
    value: 'mat1'
  }),
  createMaterial({
    category: 'cat2',
    currency: 'CAD',
    description: 'des2',
    id: 'KfN4o33h4mK212ZnOO5m',
    price: 10,
    value: 'mat2'
  }),
  createMaterial({
    category: 'cat3',
    description: 'des3',
    id: 'dCe0XJLUChDMzJ6p4dZK',
    value: 'mat3'
  }),
];

describe('MovieMaterialService unit test', () => {
  let spectator: SpectatorService<MovieMaterialService>;
  let service: MovieMaterialService;

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
    service = spectator.service;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('create material', () => {
    const material = service.createMaterial();
    // Check if the material is created like we expect and with the same id.
    const materialMock = {
      id: material.id,
      category: '',
      value: '',
      description: '',
      status: MaterialStatus.pending,
      isOrdered: false,
      isPaid: false,
      deliveryIds: []
    };
    expect(material).toEqual(materialMock);
  })

  it('should update status of materials from a movie', () => {
    const spy = jest.spyOn(service, 'update').mockImplementation();
    service.updateStatus(materialsMock, MaterialStatus.available);
    expect(spy).toHaveBeenCalledWith(['6hjACiAe2dOZ8Vab1L3u', 'KfN4o33h4mK212ZnOO5m', 'dCe0XJLUChDMzJ6p4dZK'], { status: MaterialStatus.available });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should update isOrdered materials from a movie', () => {
    const spy = jest.spyOn(service, 'update').mockImplementation();
    service.updateIsOrdered(materialsMock);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should update isPaid materials from a movie', () => {
    const spy = jest.spyOn(service, 'update').mockImplementation();
    service.updateIsPaid(materialsMock);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
