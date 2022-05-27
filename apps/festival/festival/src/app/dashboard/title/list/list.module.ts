// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { ListComponent } from './list.component';

// Blockframes
import { AppPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { EmptyMovieModule } from '@blockframes/ui/dashboard/components/empty-movie/empty-movie.module';
import { TableActionsModule } from '@blockframes/ui/dashboard/components/movie-table-actions/movie-table-actions.module';
import { MovieListHeaderModule } from '@blockframes/ui/dashboard/components/movie-list-header/movie-list-header.module';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { MaxLengthModule } from "@blockframes/utils/pipes";
import { CellModalModule } from '@blockframes/ui/cell-modal/cell-modal.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Blockframes
    TableModule,
    ToLabelModule,
    DisplayNameModule,
    EmptyMovieModule,
    TableActionsModule,
    MovieListHeaderModule,
    FilterByModule,
    TagModule,
    MaxLengthModule,
    AppPipeModule,
    CellModalModule,

    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    // Router
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class TitleListModule { }
