import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components
import { BudgetListComponent } from './budget-list.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { WaterfallBudgetFormModule } from '../../forms/budget-form/budget-form.module';
import { DownloadPipeModule } from '@blockframes/media/file/pipes/download.pipe';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { OpenPreviewModule } from '@blockframes/ui/open-preview/open-preview.module'
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DocumentShareModule } from '../document-share/document-share.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [BudgetListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    // Blockframes
    LogoSpinnerModule,
    WaterfallBudgetFormModule,
    DownloadPipeModule,
    FileNameModule,
    OpenPreviewModule,
    ImageModule,
    DocumentShareModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule,
    MatDialogModule
  ],
  exports: [
    BudgetListComponent
  ]
})
export class BudgetListModule { }
