import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ListComponent } from './list.component';

// Blockframes
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe'
import { DisplayNameModule, JoinPipeModule, ToLabelModule, TotalPipeModule } from '@blockframes/utils/pipes';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { LogoSpinnerModule } from '@blockframes/ui/rive/logo-spinner.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
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
    JoinPipeModule,
    GetTitlePipeModule,
    MaxLengthModule,
    TotalPipeModule,
    ImageModule,
    TagModule,
    LogoSpinnerModule,
    RouterModule.forChild([]),


    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [
    ListComponent
  ]
})
export class OfferListModule { }
