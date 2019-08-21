import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MovieViewComponent } from './view.component';

@NgModule({
  declarations: [MovieViewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: MovieViewComponent }
    ])
  ],
})
export class MovieViewModule {}
