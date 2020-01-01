import { NgModule } from '@angular/core';
import { MovieFormSynopsisKeyAssetsComponent } from './synopsis-keyassets.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MovieFormSynopsisKeyAssetsComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: MovieFormSynopsisKeyAssetsComponent }])
  ],
  exports: [MovieFormSynopsisKeyAssetsComponent]
})
export class MovieFormSynopsisKeyAssetsModule {}
