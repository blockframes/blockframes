import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CookieFormComponent } from './cookie-form.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Material
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatButtonModule,
  ],
  declarations: [
    CookieFormComponent,
  ],
  exports: [
    CookieFormComponent
  ]
})
export class CookieFormModule { }
