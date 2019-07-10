// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';

// Components
import { MovieViewComponent } from './pages/movie-view/movie-view.component';

@NgModule({
  declarations: [
    MovieViewComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatGridListModule,
  ],
  exports: [MovieViewComponent],
})
export class MovieSharedModule {}
