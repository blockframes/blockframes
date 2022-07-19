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

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
