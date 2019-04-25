import { ChangeDetectionStrategy, Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthQuery, User, AuthService} from '@blockframes/auth';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'toolbar-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

  @Output() loggedOut = new EventEmitter();

  public user$: Observable<User>;

  constructor(
    private service: AuthService,
    private auth: AuthQuery,
    private router: Router,
  ) {}


  ngOnInit() {
    this.user$ = this.auth.user$;
  }

  public async logout() {
    await this.service.logout();
    this.loggedOut.emit();
    this.router.navigate(['/auth']);
  }

}
