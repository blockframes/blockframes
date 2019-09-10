import { MovieCardComponent } from './movie-card.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [CommonModule, MatCardModule, MatIconModule, MatMenuModule, RouterModule],
  declarations: [MovieCardComponent],
  exports: [MovieCardComponent]
})
export class MovieCardModule {}
