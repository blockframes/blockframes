// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ExternalSaleListComponent } from './external-sales.component';

// Blockframes
import { MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { OfferPipeModule } from '@blockframes/contract/offer/pipe';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TableModule } from '@blockframes/ui/list/table/table.module';
import { MatTooltipModule } from '@angular/material/tooltip';

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
