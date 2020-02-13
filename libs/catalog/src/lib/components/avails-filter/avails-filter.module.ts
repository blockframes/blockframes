import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AvailsFilterComponent } from './avails-filter.component';


@NgModule({
  declarations: [AvailsFilterComponent],
  imports: [CommonModule],
  exports: [AvailsFilterComponent]
})
export class AvailsFilterModule {
}
