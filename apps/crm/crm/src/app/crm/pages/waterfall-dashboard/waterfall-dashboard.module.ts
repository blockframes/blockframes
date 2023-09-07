import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WaterfallDashboardComponent } from './waterfall-dashboard.component';

// Blockframes
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [WaterfallDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MovieHeaderModule,
    PricePerCurrencyModule,
    TableModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,

    RouterModule.forChild([{ path: '', component: WaterfallDashboardComponent }])
  ]
})
export class WaterfallDashboardModule { }
