import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ListComponent } from './list.component';

// Blockframes
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe'
import { DisplayNameModule, JoinPipeModule, ToDateModule, ToLabelModule, TotalPipeModule } from '@blockframes/utils/pipes';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TableFilterModule,
    ToLabelModule,
    FilterByModule,
    DisplayNameModule,
    NoTitleModule,
    ToDateModule,
    JoinPipeModule,
    GetTitlePipeModule,
    MaxLengthModule,
    TotalPipeModule,
    ImageModule,
    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  exports: [
    ListComponent
  ]
})
export class OfferListModule { }
