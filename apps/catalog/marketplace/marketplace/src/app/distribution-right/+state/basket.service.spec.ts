import { AkitaNgRouterStoreModule, RouterService } from '@datorama/akita-ng-router-store';
import { FirestoreSettingsToken, AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import {
  SpectatorService,
  createServiceFactory,
} from '@ngneat/spectator/jest';
import { BasketService } from './basket.service';
import { mockProvider } from '@ngneat/spectator/jest';
import { FirebaseOptionsToken, AngularFireModule } from '@angular/fire';
import { environment } from '../../../environments/environment.prod';

@Injectable()
class MockBasketService {
  createFireStoreId(): boolean {
    return true;
  }
}

@Injectable()
class OrganizationService {
  createFireStoreId(): boolean {
    return true;
  }
}

@Injectable()
class BasketQuery {
  createFireStoreId(): boolean {
    return true;
  }
}

@Injectable()
class BasketStore {
  createFireStoreId(): boolean {
    return true;
  }
}

describe('BasketService', () => {
  let spectator: SpectatorService<BasketService>;
  const createService = createServiceFactory({
    service: BasketService,
    imports: [AkitaNgRouterStoreModule.forRoot()],
    providers: [
      // Values in the providers must be the values you inject in the BasketService (store, queries, AngularFirestore)
      mockProvider(MockBasketService, {
        createFireStoreId: () => true
      }),
      mockProvider(OrganizationService, {}),
      mockProvider(BasketQuery, {}),
      mockProvider(BasketStore, {}),
      AngularFirestore,
      {
        provide: FirestoreSettingsToken,
        useValue: { host: 'localhost:8080', ssl: false }
      },
      {
        provide: FirebaseOptionsToken,
        useValue: { projectId: environment.firebase.appId }
      },
      mockProvider(RouterService)
    ]
  });

  beforeEach(() => (spectator = createService()));

  it('should create firestore id', () => {
    const mockService = spectator.get<MockBasketService>(MockBasketService);
    mockService.createFireStoreId.mockReturnValue(true);
    expect(spectator.service.createFireStoreId).toBeFalsy();
  });
});
 