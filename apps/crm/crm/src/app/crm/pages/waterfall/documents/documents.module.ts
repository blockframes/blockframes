import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Component
import { DocumentsComponent } from './documents.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [DocumentsComponent],
  imports: [
    BfCommonModule,

    TableModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,

    RouterModule.forChild([{ path: '', component: DocumentsComponent }])
  ]
})
export class DocumentsModule { }
