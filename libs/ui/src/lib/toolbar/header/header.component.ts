import { ChangeDetectionStrategy, Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthQuery, User, AuthService} from '@blockframes/auth';
import { Observable } from 'rxjs';
import { NotificationQuery } from '../../notification/+state';


@Component({
  selector: 'toolbar-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

  @Output() loggedOut = new EventEmitter();

  public user$: Observable<User>;
  public encryting$: Observable<boolean>;
  public notificationsLength$: Observable<number>;

  constructor(
    private service: AuthService,
    private auth: AuthQuery,
    private router: Router,
    private notificationQuery: NotificationQuery,
  ) {}


  ngOnInit() {
    this.user$ = this.auth.user$;
    this.encryting$ = this.auth.encrytping$;
    this.notificationsLength$ = this.notificationQuery.selectCount(entity => !entity.isRead);
  }

  public async logout() {
    await this.service.logout();
    this.loggedOut.emit();
    this.router.navigate(['/auth']);
  }

}
