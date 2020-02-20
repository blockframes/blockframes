import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NoTitleComponent } from './no-title.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [NoTitleComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    MatButtonModule,
    ImgAssetModule,
    RouterModule
  ],
  exports: [NoTitleComponent]
})
export class NoTitleModule { }
