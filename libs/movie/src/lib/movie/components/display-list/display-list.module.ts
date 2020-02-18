import { MovieDisplayListComponent } from './display-list.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

// Materials
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [CommonModule, ImageReferenceModule, MatTableModule, MatIconModule],
  declarations: [MovieDisplayListComponent],
  exports: [MovieDisplayListComponent]
})
export class MovieDisplayListModule {}
