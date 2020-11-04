import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { GetMediaUrlModule } from '@blockframes/media/pipes/get-media-url.pipe';
import { PreviewModalComponent } from './preview.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    ImageReferenceModule,
    GetMediaUrlModule
  ],
  exports: [PreviewModalComponent],
  declarations: [PreviewModalComponent],
})
export class PreviewModalModule { }
