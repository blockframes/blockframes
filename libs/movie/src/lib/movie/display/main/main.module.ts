import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieDisplayMainComponent } from './main.component';
import { MatCardModule, MatDividerModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
  ],
  declarations: [MovieDisplayMainComponent],
  exports: [MovieDisplayMainComponent]
})
export class MovieDisplayMainModule {}
