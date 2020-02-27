// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { NoActivityComponent } from './no-activity.component';


@NgModule({
  declarations: [NoActivityComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImgAssetModule
  ],
  exports: [NoActivityComponent]
})
export class NoActivityModule { }
