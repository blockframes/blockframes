import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TitleFilterComponent, FilterDirective } from './title-filter.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [TitleFilterComponent, FilterDirective],
  imports: [
    CommonModule,

    // Material
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
  ],
  exports: [TitleFilterComponent, FilterDirective]
})
export class TitleFilterModule {}
