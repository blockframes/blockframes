import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AuthService, AuthStore } from '@blockframes/auth/+state';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventQuery } from '@blockframes/event/+state';

@Component({
  selector: 'event-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventLoginComponent implements OnInit {

  constructor(
    private service: AuthService,
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private eventQuery: EventQuery,
    ) { }
  
  public eventId = this.eventQuery.getActiveId();
  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(24)])
  });

  ngOnInit() {
    const { email } = this.route.snapshot.queryParams;
    this.eventId = this.eventQuery.getActiveId();
    this.loginForm.get('email').setValue(email);
  }

  async validateLogin() {
    if (!this.loginForm.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }
    await this.service.deleteAnonymousUser();
    await this.service.signin(this.loginForm.value.email, this.loginForm.value.password)
    .catch(_ => {
      this.snackBar.open('Informations not valid', 'close', { duration: 2000 });
    });
  }

  clickBack() {
    this.authStore.updateAnonymousCredentials({ role: undefined });
    this.router.navigate(['../../'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }
}
