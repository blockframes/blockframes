// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TitleListComponent } from './list.component';

// Blockframes
import { ToLabelModule } from '@blockframes/utils/pipes';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { AnalyticsPipeModule } from '@blockframes/movie/pipes/analytics.pipe';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [TitleListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TableFilterModule,
    ToLabelModule,
    ImageModule,
    FilterByModule,
    AnalyticsPipeModule,
    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    // Router
    RouterModule.forChild([{ path: '', component: TitleListComponent }])
  ]
})
export class TitleListModule { }
