import { NgModule } from '@angular/core';

import { TermsComponent } from './terms.component';
import { RouterModule } from '@angular/router';
import { TermsConditionsModule } from '@blockframes/auth/components/terms-conditions/terms-conditions.module';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '', component: TermsComponent }]),
    TermsConditionsModule
  ],
  declarations: [TermsComponent],
})
export class TermsModule { }
