import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Component
import { DocumentsComponent } from './documents.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [DocumentsComponent],
  imports: [
    BfCommonModule,
    TableModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: DocumentsComponent }])
  ]
})
export class DocumentsModule { }
