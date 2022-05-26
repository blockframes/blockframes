// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Pages
import { TableActionsComponent } from './movie-table-actions.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [TableActionsComponent],
  imports: [
    // Angular
    CommonModule,
    RouterModule,
    // Material
    MatButtonModule,
    MatIconModule,
  ],
  exports: [TableActionsComponent]
})
export class TableActionsModule { }
