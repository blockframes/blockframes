import { MovieDisplayListComponent } from './display-list.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// Materials
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [CommonModule, MatTableModule, MatIconModule],
  declarations: [MovieDisplayListComponent],
  exports: [MovieDisplayListComponent]
})
export class MovieDisplayListModule {}
