import { Component, ChangeDetectionStrategy, Inject, Optional, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service';
import { FormControl, FormGroup } from '@angular/forms';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';
import { Intercom } from 'ng-intercom';
import { firstValueFrom } from 'rxjs';

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
    this.form.get('termsOfUse').setValue(profile.legalTerms?.tc[this.app]);
    this.form.get('privacyPolicy').setValue(profile.legalTerms?.privacyPolicy);
  }

  async accept() {
    const uid = this.service.uid;
    const legalTerms = {
      privacyPolicy: this.form.get('privacyPolicy').value,
      tc: {
        [this.app]: this.form.get('termsOfUse').value
      }
    }
    await this.service.update({ uid, legalTerms });
    this.router.navigate(['/']);
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
