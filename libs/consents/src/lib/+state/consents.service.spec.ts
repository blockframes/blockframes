import { TestBed } from '@angular/core/testing';
import { ConsentsService } from './consents.service';
import { IpService } from '@blockframes/utils/ip';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { FIREBASE_CONFIG, FIRESTORE_SETTINGS } from 'ngfire';

const projectIdUT = 'test-consents-ut';

class MockIpService {
  public get(): Promise<string> {
    return new Promise((res) => {
      res('127.0.0.1');
    })
  }
}

describe('Consents when user click on the button', () => {
  let service: ConsentsService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp({ projectId: projectIdUT })), // TODO #8280 remove
        provideFunctions(() => {  // TODO #8280 remove
          const functions = getFunctions(getApp());
          connectFunctionsEmulator(functions, 'localhost', 5001);
          return functions;
        }),
      ],
      providers: [
        ConsentsService,
        { provide: IpService, useClass: MockIpService },
        { provide: FIREBASE_CONFIG, useValue: { options: { projectId: projectIdUT } } },
        { provide: FIRESTORE_SETTINGS, useValue: { ignoreUndefinedProperties: true, experimentalAutoDetectLongPolling: true } }
      ],
    });

    service = TestBed.inject(ConsentsService);
  });


  test('Should check if the consent service is created', () => {
    expect(service).toBeTruthy();
  })

});
