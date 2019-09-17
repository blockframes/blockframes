import { MovieDisplayListComponent } from './display-list.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// Materials
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [MovieDisplayListComponent],
  imports: [CommonModule, MatTableModule],
  exports: [MovieDisplayListComponent]
})
export class MovieDisplayListModule {}
