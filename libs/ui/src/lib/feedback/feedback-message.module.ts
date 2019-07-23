import { NgModule } from '@angular/core';
import { FeedbackMessageComponent } from './feedback-message.component';
import { MatButtonModule } from '@angular/material';

/** A message to display to the user at the end of a tunnel */
export interface FeedbackMessage {
  headline: string;
  subline: string;
  isError?: boolean;
}

@NgModule({
  declarations: [FeedbackMessageComponent],
  imports: [
    MatButtonModule,
  ],
  exports: [FeedbackMessageComponent],
})
export class FeedbackMessageModule { }
