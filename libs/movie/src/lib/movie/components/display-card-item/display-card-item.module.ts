import { MovieDisplayCardItemComponent } from './display-card-item.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [CommonModule, MatCardModule],
  declarations: [MovieDisplayCardItemComponent],
  exports: [MovieDisplayCardItemComponent]
})
export class MovieDisplayCardItemModule {}
