import { MovieDisplayListComponent } from './display-list.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImgModule } from '@blockframes/media/components/img/img.module';

// Materials
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [CommonModule, ImgModule, MatTableModule, MatIconModule],
  declarations: [MovieDisplayListComponent],
  exports: [MovieDisplayListComponent]
})
export class MovieDisplayListModule {}
