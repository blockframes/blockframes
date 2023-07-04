// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { PricePerCurrencyComponent } from './price-per-currency.component';

@NgModule({
  imports: [CommonModule],
  exports: [PricePerCurrencyComponent],
  declarations: [PricePerCurrencyComponent],
})
export class PricePerCurrencyModule { }
