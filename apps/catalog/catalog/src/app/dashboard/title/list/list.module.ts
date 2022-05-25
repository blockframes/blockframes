// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TableModule } from "@blockframes/ui/list/table/table.module";

import { TitleListComponent } from './list.component';

// Blockframes
import { AppPipeModule, DisplayNameModule, MaxLengthModule, NumberPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { EmptyMovieModule } from '@blockframes/ui/dashboard/components/empty-movie/empty-movie.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { IncomePipeModule } from '@blockframes/contract/income/pipe';
import { CellModalModule } from '@blockframes/ui/cell-modal/cell-modal.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [TitleListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TableModule,

    // Blockframes
    MaxLengthModule,
    ToLabelModule,
    FilterByModule,
    DisplayNameModule,
    EmptyMovieModule,
    TagModule,
    NumberPipeModule,
    IncomePipeModule,
    AppPipeModule,
    CellModalModule,

    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    // Router
    RouterModule.forChild([{ path: '', component: TitleListComponent }])
  ]
})
export class TitleListModule { }
