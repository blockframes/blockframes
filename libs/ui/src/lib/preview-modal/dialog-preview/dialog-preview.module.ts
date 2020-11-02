import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

import { DialogPreviewComponent } from './dialog-preview.component';

@NgModule({
  imports: [
    CommonModule,
    ImageReferenceModule
  ],
  exports: [DialogPreviewComponent],
  declarations: [DialogPreviewComponent],
})
export class DialogModalModule { }
