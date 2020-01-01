import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieFormSynopsisKeyAssetsComponent } from './synopsis-keyassets.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
// Materials
import { MatCardModule } from '@angular/material/card';
@NgModule({
  declarations: [MovieFormSynopsisKeyAssetsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    RouterModule.forChild([{ path: '', component: MovieFormSynopsisKeyAssetsComponent }])
  ],
  exports: [MovieFormSynopsisKeyAssetsComponent]
})
export class MovieFormSynopsisKeyAssetsModule {}
