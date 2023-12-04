// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { StatementHeaderModule } from '../../statement-header/statement-header.module';
import { StatementParticipationModule } from '../../statement-participation/statement-participation.module';

// Components
import { StatementDistributorSummaryComponent } from './summary.component';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [StatementDistributorSummaryComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Blockframes
    PricePerCurrencyModule,
    TableModule,
    StatementHeaderModule,
    StatementParticipationModule,

    // Material
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  exports: [StatementDistributorSummaryComponent]
})
export class StatementDistributorSummaryModule { }
