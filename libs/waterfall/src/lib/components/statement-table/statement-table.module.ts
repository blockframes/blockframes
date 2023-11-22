// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

// Pages
import { StatementTableComponent } from './statement-table.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [StatementTableComponent],
  imports: [
    CommonModule,

    TableModule,
    ToLabelModule,
    PricePerCurrencyModule,

    // Material
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,

    // Routing
    RouterModule,
  ],
  exports: [StatementTableComponent]
})
export class StatementTableModule { }
