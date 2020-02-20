// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoMovieComponent } from './no-movie.component';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [NoMovieComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    MatButtonModule,
    ImgAssetModule,
    RouterModule
  ],
  exports: [NoMovieComponent]
})
export class NoMovieModule { }
