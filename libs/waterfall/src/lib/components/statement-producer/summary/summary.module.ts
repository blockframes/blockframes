// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Blockframes
import { StatementPeriodModule } from '@blockframes/waterfall/components/statement-period/statement-period.module';

// Components
import { StatementProducerSummaryComponent } from './summary.component';

// Material

@NgModule({
  declarations: [StatementProducerSummaryComponent],
  imports: [
    CommonModule,

    // Blockframes
    StatementPeriodModule,

    // Material

  ],
  exports: [StatementProducerSummaryComponent]
})
export class StatementProducerSummaryModule { }
