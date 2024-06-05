import { TestBed } from '@angular/core/testing';
import { NotificationService } from './service';
import { Notification } from '@blockframes/model';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { UserService } from '@blockframes/user/service';
import { AnalyticsService } from '@blockframes/analytics/service';
import { MovieService } from '@blockframes/movie/service';
import { ContractService } from '@blockframes/contract/contract/service';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';
import { AuthService } from '@blockframes/auth/service';
import { APP } from '@blockframes/utils/routes/utils';
import { FIREBASE_CONFIG, FirestoreService } from 'ngfire';

class DummyAuthService {
  profile$ = new Observable();
}

class InjectedModuleGuard {
  currentModule = 'dashboard';
}

class DummyService { }

describe('Notifications Test Suite', () => {
  let service: NotificationService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        FirestoreService,
        { provide: HttpClient, useClass: HttpTestingController },
        { provide: AuthService, useClass: DummyAuthService },
        { provide: UserService, useClass: DummyService },
        { provide: MovieService, useClass: DummyService },
        { provide: AnalyticsService, useClass: DummyService },
        { provide: ContractService, useClass: DummyService },
        { provide: ModuleGuard, useClass: InjectedModuleGuard },
        { provide: APP, useValue: 'festival' },
        { provide: FIREBASE_CONFIG, useValue: { options: { projectId: 'test' } } },
      ],
    });
    service = TestBed.inject(NotificationService);
    service.update = jest.fn();

  });

  it('Should check notif service is created', () => {
    expect(service).toBeTruthy();
  })

  it('Should mark notifications as read', async () => {

    const mock = jest.spyOn(service, 'update');

    const notif = {
      id: '1',
      app: { isRead: false },
    };

    await service.readNotification(notif);

    expect(service.update).toHaveBeenCalled();
    const { id, app } = mock.mock.calls[0][0] as unknown as Notification;

    expect(id).toBe(notif.id);
    expect(app.isRead).toBe(true);
  });

});
