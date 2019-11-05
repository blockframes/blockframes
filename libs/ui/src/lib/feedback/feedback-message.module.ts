import { NgModule } from '@angular/core';
import { FeedbackMessageComponent } from './feedback-message.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';

@NgModule({
  declarations: [FeedbackMessageComponent],
  imports: [
    MatButtonModule,
    FlexModule
  ],
  exports: [FeedbackMessageComponent],
})
export class FeedbackMessageModule { }
