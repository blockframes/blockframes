import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { RightHolderFormComponent } from './rightholder-form.component';

// Blockframes
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

@NgModule({
  declarations: [
    RightHolderFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StaticSelectModule,
    ConfirmInputModule,

    // Material
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,

  ],
  exports: [
    RightHolderFormComponent
  ]
})
export class RightHolderFormModule { }
