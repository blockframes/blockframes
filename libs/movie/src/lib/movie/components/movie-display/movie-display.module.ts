// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule, MatDividerModule } from '@angular/material';

// Libraries

// Components
import { MovieDisplayComponent } from './movie-display/movie-display.component';
import { MovieDisplayMainModule } from '../../display/main/main.module';

@NgModule({
  declarations: [
    MovieDisplayComponent,
    // @todo #643 => to-word component childs for each section
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatGridListModule,

    MovieDisplayMainModule,
  ],
  exports: [MovieDisplayComponent],
})
export class MovieDisplayModule {}
