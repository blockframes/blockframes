import { NgModule } from '@angular/core';
import { FeedbackMessageComponent } from './feedback-message.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';
import { PicturesThemeModule } from '../picture-directive/pictures.module';

@NgModule({
  declarations: [FeedbackMessageComponent],
  imports: [
    MatButtonModule,
    FlexModule,
    PicturesThemeModule
  ],
  exports: [FeedbackMessageComponent],
})
export class FeedbackMessageModule { }
