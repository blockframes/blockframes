// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SaleListComponent } from './list.component';

// Blockframes
import {
  MaxLengthModule, ToLabelModule,
} from '@blockframes/utils/pipes';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { IncomePipeModule } from '@blockframes/contract/income/pipe';
import { OfferPipeModule } from '@blockframes/contract/offer/pipe';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { IntercomModule } from 'ng-intercom';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { MatTabsModule } from '@angular/material/tabs';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';

@NgModule({
  declarations: [SaleListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TableFilterModule,
    GetTitlePipeModule,
    MaxLengthModule,
    IncomePipeModule,
    OfferPipeModule,
    ImageModule,
    ToLabelModule,
    TagModule,
    IntercomModule,
    TableModule,
    FilterByModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    // Router
    RouterModule.forChild([{ path: '', component: SaleListComponent }])
  ],
})
export class SaleListModule { }
