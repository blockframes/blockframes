import { MovieDisplayListComponent } from './display-list.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Materials
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [CommonModule, ImageModule, MatTableModule, MatIconModule],
  declarations: [MovieDisplayListComponent],
  exports: [MovieDisplayListComponent]
})
export class MovieDisplayListModule {}
