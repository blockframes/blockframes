import { NgModule } from '@angular/core';
import { OffersListComponent } from './offer-list.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import {GetTitlePipeModule} from '@blockframes/movie/pipes/get-title.pipe'

// Blockframes
import { DisplayNameModule, EllipsisPipeModule, JoinPipeModule, ToDateModule, ToLabelModule, TotalPipeModule } from '@blockframes/utils/pipes';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

@NgModule({
  declarations: [
    OffersListComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TableFilterModule,
    ToLabelModule,
    FilterByModule,
    DisplayNameModule,
    NoTitleModule,
    ToDateModule,
    JoinPipeModule,
    GetTitlePipeModule,
    EllipsisPipeModule,
    TotalPipeModule,
    ImageModule,
    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,

    //Router
    RouterModule.forChild([{ path: '', component: OffersListComponent }])
  ],
})
export class OffersListModule { }
