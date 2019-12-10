import { NgModule } from '@angular/core';
import { FeedbackMessageComponent } from './feedback-message.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';
import { PicturesModule } from '../picture-directive/pictures.module';


@NgModule({
  declarations: [FeedbackMessageComponent],
  imports: [
    MatButtonModule,
    FlexModule,
    PicturesModule
  ],
  exports: [FeedbackMessageComponent],
})
export class FeedbackMessageModule { }
