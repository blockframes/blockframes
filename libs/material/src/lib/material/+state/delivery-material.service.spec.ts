import { SpectatorService, createServiceFactory } from '@ngneat/spectator/jest';
import { AngularFireModule } from '@angular/fire';
import { initializeTestApp } from '@firebase/testing';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { MaterialStore } from './material.store';
import { CollectionService } from 'akita-ng-fire';
import { Material, MaterialStatus, createMaterial } from './material.model';
import { DeliveryMaterialService } from './delivery-material.service';
import { DeliveryQuery } from '../../delivery/+state';

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

describe('DeliveryMaterialService unit test', () => {
  let spectator: SpectatorService<DeliveryMaterialService>;
  let service: DeliveryMaterialService;

  const createService = createServiceFactory({
    service: DeliveryMaterialService,
    imports: [
      AngularFireModule.initializeApp(initTestApp),
      AngularFireFunctionsModule,
      AngularFirestoreModule
    ],
    mocks: [AngularFirestore],
    providers: [DeliveryQuery, MaterialStore]
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

  it('should update status of materials from a delivery', () => {
    const spy = jest.spyOn(service, 'update').mockImplementation();
    service.updateDeliveryMaterialStatus(materialsMock, MaterialStatus.available, 'deliveryId');
    expect(spy).toHaveBeenCalledWith(['6hjACiAe2dOZ8Vab1L3u', 'KfN4o33h4mK212ZnOO5m', 'dCe0XJLUChDMzJ6p4dZK'], { status: MaterialStatus.available });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should update isOrdered materials from a delivery', () => {
    const spy = jest.spyOn(service, 'update').mockImplementation();
    service.updateDeliveryMaterialIsOrdered(materialsMock);
    const ok = (material: Material) => ({ isOrdered: !material.isOrdered});
    expect(spy).toHaveBeenCalledWith(['6hjACiAe2dOZ8Vab1L3u', 'KfN4o33h4mK212ZnOO5m', 'dCe0XJLUChDMzJ6p4dZK']);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should update isPaid materials from a delivery', () => {
    const spy = jest.spyOn(service, 'update').mockImplementation();
    service.updateDeliveryMaterialIsPaid(materialsMock);
    expect(spy).toHaveBeenCalledWith(['6hjACiAe2dOZ8Vab1L3u', 'KfN4o33h4mK212ZnOO5m', 'dCe0XJLUChDMzJ6p4dZK']);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should update materials of a delivery', () => {
    const spyUpdate = jest.spyOn(service, 'update').mockImplementation();
    const spyAdd = jest.spyOn(service, 'add').mockImplementation();
    service.updateDeliveryMaterials(materialsMock);
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(spyAdd).toHaveBeenCalledTimes(1);
  });
});
