import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AuthQuery } from '../../+state/auth.query';
import { AuthService } from '../../+state/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'auth-email-verify',
  templateUrl: './email-verify.component.html',
  styleUrls: ['./email-verify.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailVerifyComponent implements OnInit {
  public hasVerifiedEmail$: Observable<boolean>;
  public triggeredOnce: boolean;

  constructor(private query: AuthQuery, private service: AuthService) {}

  ngOnInit() {
    this.hasVerifiedEmail$ = this.query.hasVerifiedEmail$;
    this.triggeredOnce = false;
  }

  public async sendEmail() {
    await this.service.sendVerifyEmail();
    this.triggeredOnce = true;
  }
}
