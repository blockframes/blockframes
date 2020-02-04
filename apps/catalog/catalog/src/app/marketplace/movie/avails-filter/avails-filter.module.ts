import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AvailsFilterComponent } from './avails-filter.component';

// Material
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [AvailsFilterComponent],
  imports: [
    CommonModule,

    // Material
    MatExpansionModule,
    MatFormFieldModule
  ],
  exports: [AvailsFilterComponent]
})
export class AvailsFilterModule {}
