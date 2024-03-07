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
import { StatementArbitraryChangeModule } from '../../statement-arbitrary-change/statement-arbitrary-change.module';
import { StatementIncomeEditModule } from '../../statement-income-edit/statement-income-edit.module';
import { ExpenseTypePipeModule } from '../../../../pipes/expense-type.pipe';
import { RightHolderNamePipeModule } from '../../../../pipes/rightholder-name.pipe';
import { StatementExpenseEditModule } from '../../statement-expense-edit/statement-expense-edit.module';
import { InterestTableModule } from '../../../../components/interests-table/interest-table.module';

// Components
import { StatementProducerSummaryComponent } from './summary.component';

// Material
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    StatementArbitraryChangeModule,
    StatementIncomeEditModule,
    StatementExpenseEditModule,
    ExpenseTypePipeModule,
    RightHolderNamePipeModule,
    InterestTableModule,

    // Material
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  exports: [StatementProducerSummaryComponent]
})
export class StatementProducerSummaryModule { }
