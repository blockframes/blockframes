import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CookieFormComponent } from './cookie-form.component';
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';

// Material
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';

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
