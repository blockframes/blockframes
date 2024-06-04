import { TestBed } from '@angular/core/testing';
import { ConsentsService } from './service';
import { IpService } from '@blockframes/utils/ip';

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
      providers: [
        ConsentsService,
        { provide: IpService, useClass: MockIpService },
      ],
    });

    service = TestBed.inject(ConsentsService);
  });


  test('Should check if the consent service is created', () => {
    expect(service).toBeTruthy();
  })

});
