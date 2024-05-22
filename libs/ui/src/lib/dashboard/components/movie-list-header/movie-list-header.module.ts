// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pages
import { MovieListHeaderComponent } from './movie-list-header.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

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
