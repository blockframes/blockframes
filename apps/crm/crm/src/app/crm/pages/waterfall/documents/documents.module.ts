import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DocumentsComponent } from './documents.component';
import { TableModule } from '@blockframes/ui/list/table/table.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [DocumentsComponent],
  imports: [
    CommonModule,
    TableModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: DocumentsComponent }])
  ]
})
export class DocumentsModule { }
