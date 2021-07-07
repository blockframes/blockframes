// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ContractListComponent } from './list.component';

// Blockframes
import {
  DisplayNameModule, MaxLengthModule, NumberPipeModule, ToLabelModule,
  GetIncomePipeModule,
 } from '@blockframes/utils/pipes';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { AnalyticsPipeModule } from '@blockframes/movie/pipes/analytics.pipe';
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';

@NgModule({
  declarations: [ContractListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TableFilterModule,
    ToLabelModule,
    ImageModule,
    FilterByModule,
    AnalyticsPipeModule,
    DisplayNameModule,
    NoTitleModule,
    TagModule,
    GetTitlePipeModule,
    MaxLengthModule,
    NumberPipeModule,
    GetIncomePipeModule,

    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    // Router
    RouterModule.forChild([{ path: '', component: ContractListComponent }])
  ]
})
export class ContractListModule { }
