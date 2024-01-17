// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { FormatPairPipe, PricePerCurrencyComponent } from './price-per-currency.component';

@NgModule({
  imports: [CommonModule],
  exports: [PricePerCurrencyComponent, FormatPairPipe],
  declarations: [PricePerCurrencyComponent, FormatPairPipe],
})
export class PricePerCurrencyModule { }
