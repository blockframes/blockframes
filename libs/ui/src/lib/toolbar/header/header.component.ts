import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthQuery, User, AuthService, SignupComponent } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';


@Component({
  selector: 'toolbar-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Output() loggedOut = new EventEmitter();

  public user$: Observable<User>;

  constructor(private service: AuthService, private auth: AuthQuery, private router: Router, private dialog: MatDialog) {
  }


  ngOnInit() {
    this.user$ = this.auth.select(state => state.user);
  }

  public async logout() {
    await this.service.logout();
    this.loggedOut.emit();
    this.router.navigate([''])
  }

  public openLogin() {
    this.dialog.open(SignupComponent);
  }

  ngOnDestroy() {
  }
}
