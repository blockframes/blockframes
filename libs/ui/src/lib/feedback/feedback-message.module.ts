import { NgModule } from '@angular/core';
import { FeedbackMessageComponent } from './feedback-message.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';
import { ImgAssetModule } from '../theme/img-asset.module';

@NgModule({
  declarations: [FeedbackMessageComponent],
  imports: [
    MatButtonModule,
    FlexModule,
    ImgAssetModule
  ],
  exports: [FeedbackMessageComponent],
})
export class FeedbackMessageModule { }
