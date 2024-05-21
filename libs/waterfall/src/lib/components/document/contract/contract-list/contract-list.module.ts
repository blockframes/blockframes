import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components
import { ContractListComponent } from './contract-list.component';

// Blockframes
import { ToLabelModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { CardModalModule } from '@blockframes/ui/card-modal/card-modal.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { WaterfallContractFormModule } from '../../../forms/contract-form/contract-form.module';
import { DownloadPipeModule } from '@blockframes/media/file/pipes/download.pipe';
import { RightHolderNamePipeModule } from '../../../../pipes/rightholder-name.pipe';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { DocumentShareModule } from '../../document-share/document-share.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [ContractListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WaterfallContractFormModule,
    StaticSelectModule,
    CardModalModule,
    ToLabelModule,
    ImageModule,
    DownloadPipeModule,
    RightHolderNamePipeModule,
    LogoSpinnerModule,
    DocumentShareModule,

    // Material
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatDialogModule,

    RouterModule,
  ],
  exports: [
    ContractListComponent
  ]
})
export class ContractListModule { }
