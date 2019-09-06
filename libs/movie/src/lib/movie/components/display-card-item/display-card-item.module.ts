import { MovieDisplayCardItemComponent } from './display-card-item.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, MatCardModule, RouterModule],
  declarations: [MovieDisplayCardItemComponent],
  exports: [MovieDisplayCardItemComponent]
})
export class MovieDisplayCardItemModule {}
