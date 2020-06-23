import { NgModule } from '@angular/core';
import { FeedbackMessageComponent } from './feedback-message.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
  declarations: [FeedbackMessageComponent],
  imports: [
    ImageReferenceModule,
    MatButtonModule,
    FlexModule,
  ],
  exports: [FeedbackMessageComponent],
})
export class FeedbackMessageModule { }
