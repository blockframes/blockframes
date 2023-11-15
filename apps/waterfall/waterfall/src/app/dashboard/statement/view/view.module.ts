// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { StatementHeaderModule } from '@blockframes/waterfall/components/statement-header/statement-header.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';

// Components
import { StatementViewComponent } from './view.component';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [StatementViewComponent],
  imports: [
    CommonModule,

    // Blockframes
    StatementHeaderModule,
    PricePerCurrencyModule,
    TableModule,

    // Material
    MatDividerModule,
    MatExpansionModule,

    // Routing
    RouterModule.forChild([{ path: '', component: StatementViewComponent }]),
  ],
})
export class StatementViewModule { }
