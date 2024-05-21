import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { FilterRightsPipe, StatementComponent } from './statement.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { JoinPipeModule, MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';
import { StatementHeaderModule } from '@blockframes/waterfall/components/statement/statement-header/statement-header.module';
import { StatementParticipationModule } from '@blockframes/waterfall/components/statement/statement-participation/statement-participation.module';
import { ExpenseTypePipeModule } from '@blockframes/waterfall/pipes/expense-type.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [StatementComponent, FilterRightsPipe],
  imports: [
    CommonModule,
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,

    TableModule,
    PricePerCurrencyModule,
    ToLabelModule,
    JoinPipeModule,
    MaxLengthModule,
    RightHolderNamePipeModule,
    StatementHeaderModule,
    StatementParticipationModule,
    ExpenseTypePipeModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,

    RouterModule.forChild([{ path: '', component: StatementComponent }])
  ]
})
export class StatementModule { }
