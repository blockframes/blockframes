import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ListFilterButtonsComponent } from './list-filter-buttons.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [ListFilterButtonsComponent],
  imports: [
    CommonModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  exports: [ListFilterButtonsComponent]
})
export class ListFilterButtonsModule { }
