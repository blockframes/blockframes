import { NgModule } from '@angular/core';
import { FeedbackMessageComponent } from './feedback-message.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';
import { ImgModule } from '@blockframes/ui/media/img/img.module';

@NgModule({
  declarations: [FeedbackMessageComponent],
  imports: [
    ImgModule,
    MatButtonModule,
    FlexModule,
  ],
  exports: [FeedbackMessageComponent],
})
export class FeedbackMessageModule { }
