import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalModalComponent } from './modal.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';

// Import of module components
import { FilePickerModule } from '@blockframes/media/file/picker/picker.module';
import { PreferenceModule } from '@blockframes/auth/pages/preferences/modal/preferences.module';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';
import { CookieFormModule } from '@blockframes/utils/gdpr-cookie/cookie-form/cookie-form.module';

@NgModule({
  declarations: [
    GlobalModalComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule,
  ],
  exports: [
    GlobalModalComponent
  ]
})

export class GlobalModalModule { }
