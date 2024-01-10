// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { JoinPipeModule, MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { StatementPaymentModule } from '../statement-payment/statement-payment.module';
import { RightHolderNamePipeModule } from '../../pipes/rightholder-name.pipe';
import { ContractPipeModule } from '@blockframes/contract/contract/pipe';

// Component
import { IncomesSourcesPipe, StatementTableComponent, VersionNamePipe } from './statement-table.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [StatementTableComponent, IncomesSourcesPipe, VersionNamePipe],
  imports: [
    CommonModule,

    TableModule,
    ToLabelModule,
    PricePerCurrencyModule,
    StatementPaymentModule,
    RightHolderNamePipeModule,
    ContractPipeModule,
    JoinPipeModule,
    MaxLengthModule,

    // Material
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,

    // Routing
    RouterModule,
  ],
  exports: [StatementTableComponent]
})
export class StatementTableModule { }
