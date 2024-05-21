import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ListFilterButtonsComponent } from './list-filter-buttons.component';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

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
