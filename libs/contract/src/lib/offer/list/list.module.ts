import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ConcatTitlePipeModule, ListComponent } from './list.component';

// Blockframes
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe'
import { DisplayNameModule, JoinPipeModule, ToDateModule, ToLabelModule, TotalPipeModule } from '@blockframes/utils/pipes';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ToLabelModule,
    TableModule,
    FilterByModule,
    DisplayNameModule,
    NoTitleModule,
    ToDateModule,
    JoinPipeModule,
    GetTitlePipeModule,
    MaxLengthModule,
    TotalPipeModule,
    ImageModule,
    TagModule,
    RouterModule.forChild([]),
    ConcatTitlePipeModule,

    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  exports: [
    ListComponent
  ]
})
export class OfferListModule { }
