import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarningModalComponent } from './warning/warning.component';
import { FormModalComponent } from './form/form.component';
import { InformativeModalComponent } from './informative/informative.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';

// Import of module components
import { FilePickerModule } from '@blockframes/media/file/picker/picker.module';
import { PreferenceModule } from '@blockframes/auth/pages/preferences/modal/preferences.module';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';

@NgModule({
  declarations: [
    WarningModalComponent,
    FormModalComponent,
    InformativeModalComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule,

    FilePickerModule,
    PreferenceModule,
    ConfirmInputModule
  ],
  exports: [
    WarningModalComponent,
    FormModalComponent,
    InformativeModalComponent
  ]
})

export class ModalModule { }
