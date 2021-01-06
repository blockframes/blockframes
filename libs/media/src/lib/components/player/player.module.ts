import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaPlayerComponent } from './player.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [MediaPlayerComponent],
  exports: [MediaPlayerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ]
})
export class MediaPlayerModule { }
