// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { StatementPaymentModule } from '../statement-payment/statement-payment.module';
import { RightHolderNamePipeModule } from '../../../pipes/rightholder-name.pipe';
import { ContractPipeModule } from '@blockframes/contract/contract/pipe';
import { VersionNamePipeModule } from '../../../pipes/version-name.pipe';
import { StatementShareModule } from '../statement-share/statement-share.module';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Component
import { IncomesSourcesPipe, StatementTableComponent } from './statement-table.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [StatementTableComponent, IncomesSourcesPipe],
  imports: [
    BfCommonModule,

    TableModule,
    PricePerCurrencyModule,
    StatementPaymentModule,
    RightHolderNamePipeModule,
    ContractPipeModule,
    VersionNamePipeModule,
    StatementShareModule,

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
