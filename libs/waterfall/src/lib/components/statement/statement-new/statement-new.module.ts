import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { StatementNewComponent } from './statement-new.component';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { RightholderSelectModule } from '../../rightholder/rightholder-select/rightholder-select.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

@NgModule({
  declarations: [StatementNewComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GlobalModalModule,
    RightholderSelectModule,
    ToLabelModule,
    
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,

    RouterModule,
  ],
  exports: [StatementNewComponent]
})
export class StatementNewModule { }
