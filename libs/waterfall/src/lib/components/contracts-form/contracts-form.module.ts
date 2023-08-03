import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { ContractsFormComponent, RightHolderNamePipe } from './contracts-form.component';

// Blockframes
import { CardModalModule } from '@blockframes/ui/card-modal/card-modal.module';
import { FormModule } from '@blockframes/waterfall/components/forms/document-form/form.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToLabelModule } from '@blockframes/utils/pipes';

@NgModule({
  declarations: [
    ContractsFormComponent,
    RightHolderNamePipe,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StaticSelectModule,
    CardModalModule,
    ToLabelModule,
    FormModule,

    // Material
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
  ],
  exports: [
    ContractsFormComponent
  ]
})
export class ContractsFormModule { }
