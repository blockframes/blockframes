// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { RouterModule } from '@angular/router';
import { NoDealComponent } from './no-deal.component';


@NgModule({
  declarations: [NoDealComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImgAssetModule,
    RouterModule
  ],
  exports: [NoDealComponent]
})
export class NoDealModule { }
