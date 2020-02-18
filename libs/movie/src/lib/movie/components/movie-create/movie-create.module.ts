import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';

// Component
import { MovieCreateComponent } from './movie-create.component';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImgAssetModule,

    //Material
    MatButtonModule
  ],
  declarations: [MovieCreateComponent],
  exports: [MovieCreateComponent]
})
export class MovieCreateModule {}
