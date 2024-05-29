import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CookieFormComponent } from './cookie-form.component';
import { AppPipeModule } from './../../pipes/app.pipe';

// Material
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    AppPipeModule,

    // Material
    MatCheckboxModule,
    MatRadioModule,
    MatDividerModule,
    MatSlideToggleModule,
  ],
  declarations: [
    CookieFormComponent,
  ],
  exports: [
    CookieFormComponent
  ]
})
export class CookieFormModule { }
