import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'event-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventLoginComponent implements OnInit {

  constructor(
    private service: AuthService,
    private route: ActivatedRoute
    ) { }
  
  public eventId: string;
  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('')
  });

  ngOnInit() {
    const { email } = this.route.snapshot.queryParams;
    this.eventId = this.route.snapshot.params.eventId;
    this.loginForm.get('email').setValue(email);
  }

  async validateLogin() {
    await this.service.deleteAnonymousUser();
    await this.service.signin(this.loginForm.value.email, this.loginForm.value.password);
  }
}
