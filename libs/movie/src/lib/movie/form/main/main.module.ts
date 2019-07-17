import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MovieFormMainComponent } from './main.component';

@NgModule({
  imports: [ReactiveFormsModule],
  declarations: [MovieFormMainComponent],
  exports: [MovieFormMainComponent]
})
export class MovieFormMainModule {}
