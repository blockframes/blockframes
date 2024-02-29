import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components
import { CanEditPipe, ContractsFormComponent } from './contracts-form.component';

// Blockframes
import { ToLabelModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { CardModalModule } from '@blockframes/ui/card-modal/card-modal.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { DocumentFormModule } from '../forms/document-form/form.module';
import { DownloadPipeModule } from '@blockframes/media/file/pipes/download.pipe';
import { RightHolderNamePipeModule } from '../../pipes/rightholder-name.pipe';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [ContractsFormComponent, CanEditPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DocumentFormModule,
    StaticSelectModule,
    CardModalModule,
    ToLabelModule,
    ImageModule,
    DownloadPipeModule,
    RightHolderNamePipeModule,
    LogoSpinnerModule,

    // Material
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSnackBarModule,

    RouterModule,
  ],
  exports: [
    ContractsFormComponent
  ]
})
export class ContractsFormModule { }
