import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ListFilterButtonsComponent } from './list-filter-buttons.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ListFilterButtonsComponent],
  imports: [
    CommonModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  exports: [ListFilterButtonsComponent]
})
export class ListFilterButtonsModule { }
