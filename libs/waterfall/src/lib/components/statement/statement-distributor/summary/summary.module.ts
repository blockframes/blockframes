// Angular
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { StatementHeaderModule } from '../../statement-header/statement-header.module';
import { StatementParticipationModule } from '../../statement-participation/statement-participation.module';
import { StatementArbitraryChangeModule } from '../../statement-arbitrary-change/statement-arbitrary-change.module';
import { ExpenseTypePipeModule } from '../../../../pipes/expense-type.pipe';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Components
import { StatementDistributorSummaryComponent } from './summary.component';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [StatementDistributorSummaryComponent],
  imports: [
    BfCommonModule,
    ReactiveFormsModule,

    // Blockframes
    PricePerCurrencyModule,
    TableModule,
    StatementHeaderModule,
    StatementParticipationModule,
    StatementArbitraryChangeModule,
    ExpenseTypePipeModule,

    // Material
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  exports: [StatementDistributorSummaryComponent]
})
export class StatementDistributorSummaryModule { }
