import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component & Libs
import { MovieCardModule } from '@blockframes/ui/movie-card/movie-card.module';
import { MovieListComponent } from './movie-list.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    MovieCardModule,

    //Material
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    MatButtonModule
  ],
  declarations: [MovieListComponent],
  exports: [MovieListComponent]
})
export class MovieListModule {}
