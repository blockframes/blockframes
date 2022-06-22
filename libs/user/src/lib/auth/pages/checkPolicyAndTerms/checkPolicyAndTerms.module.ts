import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { AppPipeModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from '@angular/material/checkbox';

// Component
import { CheckPolicyAndTermsComponent } from './checkPolicyAndTerms.component';

@NgModule({
  declarations: [CheckPolicyAndTermsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    AppLogoModule,
    ReactiveFormsModule,
    AppPipeModule,
    ImageModule,

    // Material
    MatButtonModule,
    MatCheckboxModule,

    RouterModule.forChild([{ path: '', component: CheckPolicyAndTermsComponent }]),
  ],
})
export class CheckPolicyAndTermsModule { }
