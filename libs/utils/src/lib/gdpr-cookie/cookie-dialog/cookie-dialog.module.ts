import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { CookieDialogComponent } from './cookie-dialog.component';
import { CookieFormModule } from '../cookie-form/cookie-form.module';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatDialogModule,
    MatCardModule,
    CookieFormModule,
    MatButtonModule,
    MatDividerModule,
    GlobalModalModule
  ],
  exports: [],
  declarations: [CookieDialogComponent],
})
export class CookieDialogModule { }
