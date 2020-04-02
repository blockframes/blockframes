import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TitleFilterComponent } from './title-filter.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [TitleFilterComponent],
  imports: [
    CommonModule,

    // Material
    MatCardModule,
    MatDividerModule,
  ],
  exports: [TitleFilterComponent]
})
export class TitleFilterModule {}
