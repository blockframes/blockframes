import { initializeTestApp } from '@firebase/testing';
import { DeliveryService } from './delivery.service';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { AngularFireModule } from '@angular/fire';
import { AngularFireFunctionsModule, AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { BasketQuery } from '@blockframes/marketplace/app/distribution-right/+state/basket.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFireAuth } from '@angular/fire/auth';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { TemplateQuery } from '../../template/+state/template.query';
import { MaterialQuery } from '../../material/+state/material.query';
import { MaterialService } from '../../material/+state/material.service';
import { DeliveryQuery } from '@blockframes/material';
import { PermissionsService } from '@blockframes/organization/permissions/+state/permissions.service';
import { StakeholderService } from '../stakeholder/+state/stakeholder.service';
import { WalletService } from '@blockframes/ethers/wallet/+state/wallet.service';
import { FireQuery } from '@blockframes/utils/firequery/firequery';
import { firebase } from '@env';

const mockDelivery = {
  id: 'JHhQjPTC0QlpXU5odQXy',
  isPaid: false,
  movieId: '8r9WipbhMv0x9AEikgDy',
  mustBeSigned: false,
  mustChargeMaterials: true,
  status: 'Delivery in negotiation',
  steps: [],
  validated: [],
  dueDate: null,
  mgDeadlines: []
};

const initTestApp = initializeTestApp({
  projectId: 'my-test-project',
  auth: { uid: 'alice', email: 'alice@example.com' }
});

describe('DeliveryService', () => {
  let spectator: SpectatorService<DeliveryService>;
  let deliveryService: DeliveryService;

  const createService = createServiceFactory({
    service: DeliveryService,
    imports: [
      AngularFireModule.initializeApp(initTestApp),
      AngularFirestoreModule,
      RouterTestingModule.withRoutes([]),
    ],
    mocks: [
      AngularFirestore,
      AngularFireFunctions,
      DeliveryService,
      AngularFireAuth,
      MovieQuery,
      TemplateQuery,
      MaterialQuery,
      MaterialService,
      OrganizationQuery,
      DeliveryQuery,
      PermissionsService,
      StakeholderService,
      WalletService,

    ],
    providers: [FireQuery]
  });

  beforeEach(() => {
    spectator = createService();
    deliveryService = spectator.get(DeliveryService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(deliveryService).toBeTruthy();
  });

  // it('should update delivery status', () => {
  //   const fireQuerySpy = jest.spyOn(spectator.get(FireQuery), 'doc');
  const updateSpy =  jest.spyOn(spectator.get(FireQuery), 'doc').mockReturnValue({ update: true });

  //   const service = spectator.get(DeliveryService);
  //   service.updateDeliveryStatus(1);
  //   expect(fireQuerySpy).toHaveBeenCalled();
  // })
});
