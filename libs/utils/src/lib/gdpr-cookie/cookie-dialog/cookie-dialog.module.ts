import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
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
