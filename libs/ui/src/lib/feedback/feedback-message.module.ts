import { NgModule } from '@angular/core';
import { FeedbackMessageComponent } from './feedback-message.component';
import { MatButtonModule } from '@angular/material';

// TODO: delete FeedbackMessage issue#680
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
