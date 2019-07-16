// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';

// Components
import { MovieDisplayComponent } from './pages/movie-display/movie-display.component';

@NgModule({
  declarations: [
    MovieDisplayComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatGridListModule,
  ],
  exports: [MovieDisplayComponent],
})
export class MovieSharedModule {}
