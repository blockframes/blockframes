import { Component, ChangeDetectionStrategy, Inject, Optional, OnInit } from '@angular/core';
import { AuthService } from '../../service';
import { FormControl, FormGroup } from '@angular/forms';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';
import { Intercom } from 'ng-intercom';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'checkPolicyAndTerms-view',
  templateUrl: './checkPolicyAndTerms.component.html',
  styleUrls: ['./checkPolicyAndTerms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckPolicyAndTermsComponent implements OnInit {

  public form = new FormGroup({
    termsOfUse: new FormControl(),
    privacyPolicy: new FormControl()
  });

  constructor(
    private service: AuthService,
    private router: Router,
    @Inject(APP) public app: App,
    @Optional() private intercom: Intercom
  ) { }

  async ngOnInit() {
    const profile = await firstValueFrom(this.service.profile$);
    const isPrivacyAccepted = profile.privacyPolicy?.date >= new Date(this.service.privacyPolicyDate);
    const isTCAccepted = profile.termsAndConditions?.[this.app]?.date >= new Date(this.service.privacyPolicyDate)
      this.form.get('termsOfUse').setValue(isTCAccepted);
      this.form.get('privacyPolicy').setValue(isPrivacyAccepted);
  }

  async accept() {
    const legalTerms = await this.service.getLegalTerms();
    const privacyPolicy = legalTerms;
    const termsAndConditions = {
      [this.app]: legalTerms
    };

    await this.service.update({ termsAndConditions, privacyPolicy });
    this.router.navigate(['/c/o'])
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
