// Angular
import { NgModule } from '@angular/core';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Component
import { InterestTableComponent } from './interest-table.component';

// Material
import { MatTooltipModule } from '@angular/material/tooltip';;

@NgModule({
  declarations: [InterestTableComponent],
  imports: [
    BfCommonModule,

    TableModule,
    PricePerCurrencyModule,

    // Material
    MatTooltipModule,
  ],
  exports: [InterestTableComponent]
})
export class InterestTableModule { }
