// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { ExternalSaleListComponent } from './external-sales.component';
import { MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { OfferPipeModule } from '@blockframes/contract/offer/pipe';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';


@NgModule({
  declarations: [
    ExternalSaleListComponent,
  ],
  imports: [
    CommonModule,
    GetTitlePipeModule,
    MaxLengthModule,
    OfferPipeModule,
    ToLabelModule,
    TableModule,
    PricePerCurrencyModule,

    // Material
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,

    // Router
    RouterModule.forChild([])
  ],
  exports: [
    ExternalSaleListComponent,
  ]
})
export class ExternalSaleListModule { }
