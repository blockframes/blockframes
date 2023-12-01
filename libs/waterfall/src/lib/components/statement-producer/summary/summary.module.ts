// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Blockframes
import { StatementPeriodModule } from '../../statement-period/statement-period.module';
import { StatementHeaderModule } from '../../statement-header/statement-header.module';
import { IncomingStatementModule } from '../incoming-statements/incoming-statements.module';

// Components
import { StatementProducerSummaryComponent } from './summary.component';

// Material

@NgModule({
  declarations: [StatementProducerSummaryComponent],
  imports: [
    CommonModule,

    // Blockframes
    StatementPeriodModule,
    StatementHeaderModule,
    IncomingStatementModule,

    // Material

  ],
  exports: [StatementProducerSummaryComponent]
})
export class StatementProducerSummaryModule { }
