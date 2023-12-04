// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Blockframes
import { StatementPeriodModule } from '../../statement-period/statement-period.module';
import { StatementHeaderModule } from '../../statement-header/statement-header.module';
import { IncomingStatementModule } from '../incoming-statements/incoming-statements.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { StatementParticipationModule } from '../../statement-participation/statement-participation.module';

// Components
import { StatementProducerSummaryComponent } from './summary.component';

// Material
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [StatementProducerSummaryComponent],
  imports: [
    CommonModule,

    // Blockframes
    StatementPeriodModule,
    StatementHeaderModule,
    IncomingStatementModule,
    TableModule,
    PricePerCurrencyModule,
    StatementParticipationModule,

    // Material
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
  ],
  exports: [StatementProducerSummaryComponent]
})
export class StatementProducerSummaryModule { }
