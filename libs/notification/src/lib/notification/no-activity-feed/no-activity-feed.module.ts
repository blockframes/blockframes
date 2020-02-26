// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { NoActivityFeedComponent } from './no-activity-feed.component';


@NgModule({
  declarations: [NoActivityFeedComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImgAssetModule
  ],
  exports: [NoActivityFeedComponent]
})
export class NoActivityFeedModule { }
