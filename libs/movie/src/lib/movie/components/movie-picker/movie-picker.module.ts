import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviePickerComponent } from './movie-picker.component';
import { MovieCardModule } from '@blockframes/ui/movie-card/movie-card.module';

@NgModule({
  imports: [CommonModule, MovieCardModule],
  declarations: [MoviePickerComponent],
  exports: [MoviePickerComponent]
})
export class MoviePickerModule {}
