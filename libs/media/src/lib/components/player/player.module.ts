import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaPlayerComponent } from './player.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [MediaPlayerComponent],
  exports: [MediaPlayerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatProgressSpinnerModule,
  ]
})
export class MediaPlayerModule { }
