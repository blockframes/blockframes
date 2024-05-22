import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

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
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
