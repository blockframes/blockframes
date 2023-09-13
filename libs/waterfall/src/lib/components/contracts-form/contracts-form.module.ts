import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { ContractsFormComponent, RightHolderNamePipe } from './contracts-form.component';

// Blockframes
import { ToLabelModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { CardModalModule } from '@blockframes/ui/card-modal/card-modal.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { DocumentFormModule } from '@blockframes/waterfall/components/forms/document-form/form.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    ContractsFormComponent,
    RightHolderNamePipe,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DocumentFormModule,
    StaticSelectModule,
    CardModalModule,
    ToLabelModule,
    ImageModule,

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
