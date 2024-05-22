import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { RightholderSelectModalComponent } from './rightholder-select-modal.component';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { RightholderSelectModule } from '../rightholder-select/rightholder-select.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

@NgModule({
  declarations: [
    RightholderSelectModalComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GlobalModalModule,
    RightholderSelectModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
  ],
  exports: [
    RightholderSelectModalComponent
  ]
})
export class RightholderSelectModalModule { }
