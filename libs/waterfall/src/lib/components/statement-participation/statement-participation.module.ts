// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatementParticipationComponent } from './statement-participation.component';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

@NgModule({
  declarations: [StatementParticipationComponent],
  imports: [
    CommonModule,
    PricePerCurrencyModule,
  ],
  exports: [StatementParticipationComponent]
})
export class StatementParticipationModule { }
