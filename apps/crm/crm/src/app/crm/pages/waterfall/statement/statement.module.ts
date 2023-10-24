import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgApexchartsModule } from 'ng-apexcharts';

import { FilterRightsPipe, StatementComponent } from './statement.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { JoinPipeModule, MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [StatementComponent, FilterRightsPipe],
  imports: [
    CommonModule,
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,

    TableModule,
    PricePerCurrencyModule,
    ToLabelModule,
    JoinPipeModule,
    MaxLengthModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatInputModule,
    MatDatepickerModule,

    RouterModule.forChild([{ path: '', component: StatementComponent }])
  ]
})
export class StatementModule { }
