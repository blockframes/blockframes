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
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';
import { StatementHeaderModule } from '@blockframes/waterfall/components/statement-header/statement-header.module';
import { StatementParticipationModule } from '@blockframes/waterfall/components/statement-participation/statement-participation.module';
import { ExpenseTypePipeModule } from '@blockframes/waterfall/pipes/expense-type.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
    LogoSpinnerModule,
    RightHolderNamePipeModule,
    StatementHeaderModule,
    StatementParticipationModule,
    ExpenseTypePipeModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatInputModule,
    MatDatepickerModule,
    MatSlideToggleModule,

    RouterModule.forChild([{ path: '', component: StatementComponent }])
  ]
})
export class StatementModule { }
