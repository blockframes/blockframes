import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieDisplayMainComponent } from './main.component';

@NgModule({
  imports: [CommonModule],
  declarations: [MovieDisplayMainComponent],
  exports: [MovieDisplayMainComponent]
})
export class MovieDisplayMainModule {}
