// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SaleListComponent } from './list.component';

// Blockframes
import { MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { IncomePipeModule } from '@blockframes/contract/income/pipe';
import { OfferPipeModule } from '@blockframes/contract/offer/pipe';
import { GetOrgPipeModule, OrgNameModule } from '@blockframes/organization/pipes';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { MatTabsModule } from '@angular/material/tabs';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { NegotiationPipeModule } from '@blockframes/contract/negotiation/pipe';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [SaleListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    GetTitlePipeModule,
    MaxLengthModule,
    IncomePipeModule,
    OfferPipeModule,
    ImageModule,
    ToLabelModule,
    TagModule,
    TableModule,
    FilterByModule,
    NegotiationPipeModule,
    GetOrgPipeModule,
    OrgNameModule,

    // Material
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,

    // Router
    RouterModule.forChild([])
  ],
  exports: [SaleListComponent]
})
export class SaleListModule { }
