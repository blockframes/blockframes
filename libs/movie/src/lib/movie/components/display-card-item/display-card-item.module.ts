import { MovieDisplayCardItemComponent } from './display-card-item.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule, MatIconModule } from '@angular/material';

@NgModule({
  imports: [CommonModule, MatCardModule, RouterModule, MatMenuModule, MatIconModule],
  declarations: [MovieDisplayCardItemComponent],
  exports: [MovieDisplayCardItemComponent]
})
export class MovieDisplayCardItemModule {}
