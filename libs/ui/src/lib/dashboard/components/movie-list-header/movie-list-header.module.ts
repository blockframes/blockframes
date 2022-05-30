// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pages
import { MovieListHeaderComponent } from './movie-list-header.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [MovieListHeaderComponent],
  imports: [
    RouterModule,

    // Material
    MatIconModule,
    MatTooltipModule,
    MatButtonModule
  ],
  exports: [MovieListHeaderComponent]
})
export class MovieListHeaderModule { }
