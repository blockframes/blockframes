// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoMovieComponent } from './no-movie.component';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ImgModule } from '@blockframes/ui/media/img/img.module';

@NgModule({
  declarations: [NoMovieComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    ImgModule,
    MatButtonModule,
    RouterModule
  ],
  exports: [NoMovieComponent]
})
export class NoMovieModule { }
