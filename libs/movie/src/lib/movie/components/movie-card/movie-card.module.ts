import { MovieCardComponent } from './movie-card.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [CommonModule, MatCardModule],
  declarations: [MovieCardComponent],
  exports: [MovieCardComponent]
})
export class MovieCardModule {}
