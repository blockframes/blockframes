// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TitleListComponent } from './list.component';

// Blockframes
import { EmptyMovieModule } from '@blockframes/ui/dashboard/components/empty-movie/empty-movie.module';
import { MovieListHeaderModule } from '@blockframes/ui/dashboard/components/movie-list-header/movie-list-header.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module'
import { MovieTableGridModule } from '@blockframes/movie/dashboard/table-grid/table-grid.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

@NgModule({
  declarations: [TitleListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Blockframes
    EmptyMovieModule,
    MovieListHeaderModule,
    LogoSpinnerModule,
    MovieTableGridModule,

    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    // Router
    RouterModule.forChild([{ path: '', component: TitleListComponent }])
  ]
})
export class TitleListModule { }
