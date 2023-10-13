import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgApexchartsModule } from 'ng-apexcharts';

import { FilterRightsPipe, WaterfallStatementComponent } from './waterfall-statement.component';

// Blockframes
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
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

@NgModule({
  declarations: [WaterfallStatementComponent, FilterRightsPipe],
  imports: [
    CommonModule,
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,

    MovieHeaderModule,
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

    RouterModule.forChild([{ path: '', component: WaterfallStatementComponent }])
  ]
})
export class WaterfallStatementModule { }
